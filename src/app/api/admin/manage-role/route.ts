import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
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

    const { userId, newRole, commissionRate, email, password, transferTo } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 });
    }

    if (!['customer', 'manager'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Don't allow changing own role
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });
    }

    const admin = createAdminClient();

    const updateData: Record<string, unknown> = { role: newRole };

    // If promoting to manager, set commission rate and add email/password login
    if (newRole === 'manager') {
      if (commissionRate !== undefined) {
        updateData.manager_commission_rate = Math.max(0, Math.min(100, Number(commissionRate)));
      }

      // Add email + password for admin-login access
      if (email && password) {
        if (password.length < 6) {
          return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 });
        }

        const authUpdate: Record<string, unknown> = { email, password };
        const { error: authError } = await admin.auth.admin.updateUserById(userId, authUpdate);
        if (authError) {
          console.error('Auth update error:', authError);
          return NextResponse.json(
            { error: authError.message.includes('already been registered')
                ? 'Этот email уже занят'
                : 'Ошибка обновления авторизации' },
            { status: 400 }
          );
        }
      }
    }

    // If demoting from manager: detach corporate email, transfer/unassign clients
    if (newRole === 'customer') {
      // Detach corporate email so it can be reassigned to another manager
      // Replace with a unique placeholder email and random password
      const { data: authData } = await admin.auth.admin.getUserById(userId);
      if (authData?.user?.email && !authData.user.email.endsWith('@placeholder.local')) {
        const randomPass = crypto.randomUUID();
        await admin.auth.admin.updateUserById(userId, {
          email: `detached_${userId.slice(0, 8)}@placeholder.local`,
          password: randomPass,
          email_confirm: true,
        });
      }

      if (transferTo) {
        // Transfer clients to another manager
        await admin
          .from('profiles')
          .update({ manager_id: transferTo })
          .eq('manager_id', userId);
      } else {
        // Unassign all clients
        await admin
          .from('profiles')
          .update({ manager_id: null })
          .eq('manager_id', userId);
      }
    }

    const { error } = await admin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Role update error:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manage role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
