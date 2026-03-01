import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientId = request.nextUrl.searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  // Manager can only see notes for their own clients
  if (profile.role === 'manager') {
    const { data: clientProfile } = await admin
      .from('profiles')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (clientProfile?.manager_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { data: notes } = await admin
    .from('client_notes')
    .select('id, content, created_at, author_id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  // Fetch author names
  const authorIds = [...new Set((notes || []).map((n) => n.author_id))];
  const authorMap: Record<string, string> = {};
  if (authorIds.length > 0) {
    const { data: authors } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', authorIds);
    (authors || []).forEach((a) => {
      authorMap[a.id] = a.full_name || 'Без имени';
    });
  }

  const enriched = (notes || []).map((n) => ({
    ...n,
    author_name: authorMap[n.author_id] || 'Без имени',
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { clientId, content } = body;

  if (!clientId || !content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'clientId and content required' }, { status: 400 });
  }

  // Manager can only add notes to their own clients
  if (profile.role === 'manager') {
    const { data: clientProfile } = await admin
      .from('profiles')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (clientProfile?.manager_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { data: note, error } = await admin
    .from('client_notes')
    .insert({
      client_id: clientId,
      author_id: user.id,
      content: content.trim(),
    })
    .select('id, content, created_at, author_id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get author name
  const { data: authorProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  await logActivity({
    actorId: user.id,
    action: 'client.note_added',
    entityType: 'profile',
    entityId: clientId,
  });

  return NextResponse.json({
    ...note,
    author_name: authorProfile?.full_name || 'Без имени',
  });
}
