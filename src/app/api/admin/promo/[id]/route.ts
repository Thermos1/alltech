import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/activity-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const admin = createAdminClient();

    // Toggle is_active
    if (typeof body.is_active === 'boolean') {
      const { error } = await admin
        .from('promo_codes')
        .update({ is_active: body.is_active })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
      }

      await logActivity({
        actorId: user.id,
        action: body.is_active ? 'promo.activated' : 'promo.deactivated',
        entityType: 'promo_code',
        entityId: id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
  } catch (error) {
    console.error('Promo update error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();

    // Check if promo was used in orders
    const { count } = await admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('promo_code_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить промокод, который был использован в заказах. Деактивируйте его.' },
        { status: 409 }
      );
    }

    const { data: promo } = await admin
      .from('promo_codes')
      .select('code')
      .eq('id', id)
      .single();

    const { error } = await admin
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
    }

    await logActivity({
      actorId: user.id,
      action: 'promo.deleted',
      entityType: 'promo_code',
      details: { code: promo?.code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Promo delete error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
