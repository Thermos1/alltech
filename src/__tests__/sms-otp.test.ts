import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin client
const mockFrom = vi.fn();
const mockAdminAuth = {
  admin: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    generateLink: vi.fn(),
  },
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: mockAdminAuth,
  }),
}));

vi.mock('@/lib/sms', () => ({
  sendSms: vi.fn().mockResolvedValue(true),
  generateOtpCode: vi.fn().mockReturnValue('1234'),
}));

describe('POST /api/auth/send-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing phone', async () => {
    const { POST } = await import('@/app/api/auth/send-otp/route');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('rate-limits rapid OTP requests', async () => {
    // Mock: recent OTP exists (< 60 seconds ago)
    // Chain: .from('otp_codes').select('created_at').eq('phone',X).eq('verified',false).order().limit(1).single()
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                single: () => Promise.resolve({
                  data: { created_at: new Date().toISOString() },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const { POST } = await import('@/app/api/auth/send-otp/route');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+79241716122' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(429);
  });
});

describe('POST /api/auth/verify-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing phone or code', async () => {
    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const req = new Request('http://localhost/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+79241716122' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid code', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: () => ({
                limit: () => ({
                  single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const req = new Request('http://localhost/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+79241716122', code: '0000' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });
});

describe('generateOtpCode', () => {
  it('generates 4-digit code', async () => {
    // Unmock to test real function
    const { generateOtpCode } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{4}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(1000);
    expect(Number(code)).toBeLessThanOrEqual(9999);
  });
});

describe('sendSms (dev mode)', () => {
  it('returns true in dev mode without SMS_RU_API_KEY', async () => {
    const { sendSms } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const result = await sendSms('79241716122', 'Test message');
    expect(result).toBe(true);
  });
});
