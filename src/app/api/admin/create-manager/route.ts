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

    const { fullName, email, password, commissionRate } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Имя, email и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create auth user with email+password
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json(
        { error: createError.message.includes('already been registered')
            ? 'Этот email уже занят'
            : 'Ошибка создания пользователя' },
        { status: 400 }
      );
    }

    // Set profile: role=manager, full_name, commission rate
    const rate = Math.max(0, Math.min(100, Number(commissionRate || 3)));
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        role: 'manager',
        full_name: fullName,
        manager_commission_rate: rate,
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Rollback: delete the auth user
      await admin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: 'Ошибка создания профиля' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (error) {
    console.error('Create manager error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
