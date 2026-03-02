import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Введите код' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const admin = createAdminClient();

    // Find matching OTP
    const { data: otpRecord } = await admin
      .from('otp_codes')
      .select('id, expires_at')
      .eq('phone', cleanPhone)
      .eq('code', code)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Код истёк, запросите новый' }, { status: 400 });
    }

    // Mark OTP as verified
    await admin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists with this phone (query profiles directly — O(1), no pagination issues)
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .limit(1)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create new user via admin API
      const email = `${cleanPhone}@phone.altech.local`;
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        phone: cleanPhone,
        password: `otp_${cleanPhone}_${Date.now()}`,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { phone: cleanPhone },
      });

      if (createError || !newUser?.user) {
        console.error('Create user error:', createError);
        return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 });
      }

      userId = newUser.user.id;
      isNewUser = true;
    }

    // Get the user's email for magic link generation
    const userEmail = existingProfile
      ? (await admin.auth.admin.getUserById(userId)).data.user?.email || `${cleanPhone}@phone.altech.local`
      : `${cleanPhone}@phone.altech.local`;

    // Generate magic link / session token for the user
    const { data: sessionData, error: sessionError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (sessionError || !sessionData) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 500 });
    }

    // Return the hashed token for client-side session exchange
    return NextResponse.json({
      success: true,
      isNewUser,
      userId,
      email: userEmail,
      token_hash: sessionData.properties?.hashed_token,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
