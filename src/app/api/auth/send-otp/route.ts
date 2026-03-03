import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSms, generateOtpCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Введите номер телефона' }, { status: 400 });
    }

    // Normalize phone
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');

    const admin = createAdminClient();

    // Rate limit: max 1 OTP per 60 seconds per phone
    const { data: recentOtp } = await admin
      .from('otp_codes')
      .select('created_at')
      .eq('phone', cleanPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentOtp) {
      const elapsed = Date.now() - new Date(recentOtp.created_at).getTime();
      if (elapsed < 60_000) {
        const waitSec = Math.ceil((60_000 - elapsed) / 1000);
        return NextResponse.json(
          { error: `Подождите ${waitSec} сек. перед повторной отправкой` },
          { status: 429 }
        );
      }
    }

    // Generate code and save
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    await admin.from('otp_codes').insert({
      phone: cleanPhone,
      code,
      expires_at: expiresAt,
    });

    // Send SMS
    const sent = await sendSms(cleanPhone, `ALTEH: Vash kod: ${code}`);

    if (!sent) {
      return NextResponse.json({ error: 'Не удалось отправить SMS' }, { status: 500 });
    }

    return NextResponse.json({ success: true, devCode: process.env.SMS_RU_API_KEY ? undefined : code });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
