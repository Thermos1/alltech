/**
 * SMS.ru API client for sending OTP codes.
 * Uses GET API: https://sms.ru/sms/send?api_id=XXX&to=79241716122&msg=Kod:1234&json=1
 *
 * When SMS_RU_API_KEY is not set, logs the code to console (dev mode).
 * Sender: "Alteh" (approved on SMS.ru for Beeline).
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
    url.searchParams.set('from', process.env.SMS_RU_SENDER || 'Alteh');

    const res = await fetch(url.toString());
    const data = await res.json();

    // Log full response for delivery debugging
    console.log(`[SMS] Response for ${cleanPhone}:`, JSON.stringify(data));

    // SMS.ru returns { status: "OK", sms: { "79xx...": { status: "OK", sms_id: "..." } } }
    // Check both overall status AND per-number status
    if (data.status === 'OK') {
      // Check per-number delivery status (204 = operator not activated for sender)
      const smsInfo = data.sms?.[cleanPhone];
      if (smsInfo && smsInfo.status_code && smsInfo.status_code !== 100) {
        console.error(`[SMS] Per-number error for ${cleanPhone}: code=${smsInfo.status_code}, status=${smsInfo.status}`);
        return false;
      }
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
