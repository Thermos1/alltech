/**
 * SMS.ru API client for sending OTP codes.
 * Uses GET API: https://sms.ru/api/send?api_id=XXX&to=79241716122&msg=Код:1234&json=1
 *
 * When SMS_RU_API_KEY is not set, logs the code to console (dev mode).
 */

const SMS_RU_API_KEY = process.env.SMS_RU_API_KEY;

export async function sendSms(phone: string, message: string): Promise<boolean> {
  // Normalize phone: remove +, spaces, dashes, brackets
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');

  if (!SMS_RU_API_KEY) {
    // Dev mode — log to console
    console.log(`[SMS DEV] to: ${cleanPhone}, message: ${message}`);
    return true;
  }

  try {
    const url = new URL('https://sms.ru/sms/send');
    url.searchParams.set('api_id', SMS_RU_API_KEY);
    url.searchParams.set('to', cleanPhone);
    url.searchParams.set('msg', message);
    url.searchParams.set('json', '1');

    const res = await fetch(url.toString());
    const data = await res.json();

    // SMS.ru returns { status: "OK" } on success
    if (data.status === 'OK') {
      return true;
    }

    console.error('[SMS] Send failed:', data);
    return false;
  } catch (error) {
    console.error('[SMS] Error:', error);
    return false;
  }
}

export function generateOtpCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
