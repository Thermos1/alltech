import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase admin client
const mockFrom = vi.fn();
const mockAdminAuth = {
  admin: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    generateLink: vi.fn(),
    getUserById: vi.fn(),
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

// ─── send-otp ────────────────────────────────────────────────

describe('POST /api/auth/send-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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

  it('returns 400 for short phone', async () => {
    const { POST } = await import('@/app/api/auth/send-otp/route');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '123' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('rate-limits rapid OTP requests', async () => {
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
    const body = await res.json();
    expect(body.error).toMatch(/Подождите/);
  });

  it('sends OTP successfully when no rate-limit', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    // First call: select (rate-limit check) — no recent OTP
    // Second call: insert
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'otp_codes' && callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return { insert: mockInsert };
    });

    const { POST } = await import('@/app/api/auth/send-otp/route');
    const { sendSms } = await import('@/lib/sms');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+7 924 171-61-22' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
    expect(sendSms).toHaveBeenCalledWith('79241716122', 'ALTEH: Vash kod: 1234');
  });

  it('sends OTP with Latin text (not Cyrillic)', async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      if (callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const { POST } = await import('@/app/api/auth/send-otp/route');
    const { sendSms } = await import('@/lib/sms');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '89141082051' }),
    });
    await POST(req as never);
    // Verify SMS text is Latin (critical for SMS.ru delivery)
    const smsCall = vi.mocked(sendSms).mock.calls[0];
    expect(smsCall[1]).toMatch(/^ALTEH: Vash kod: \d{4}$/);
    expect(smsCall[1]).not.toMatch(/[а-яА-ЯёЁ]/); // No Cyrillic
  });

  it('returns 500 when SMS send fails', async () => {
    const { sendSms } = await import('@/lib/sms');
    vi.mocked(sendSms).mockResolvedValueOnce(false);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      if (callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const { POST } = await import('@/app/api/auth/send-otp/route');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+79241716122' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/SMS/);
  });

  it('normalizes phone by stripping spaces, dashes, brackets, plus', async () => {
    let insertedPhone = '';
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      if (callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: (col: string, val: string) => {
              if (col === 'phone') insertedPhone = val;
              return {
                eq: () => ({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({ data: null, error: null }),
                    }),
                  }),
                }),
              };
            },
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const { POST } = await import('@/app/api/auth/send-otp/route');
    const req = new Request('http://localhost/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+7 (924) 171-61-22' }),
    });
    await POST(req as never);
    expect(insertedPhone).toBe('79241716122');
  });
});

// ─── verify-otp ──────────────────────────────────────────────

describe('POST /api/auth/verify-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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

  it('returns 400 for missing code', async () => {
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
    const body = await res.json();
    expect(body.error).toMatch(/Неверный код/);
  });

  it('returns 400 for expired code', async () => {
    const expiredDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
    mockFrom.mockReturnValue({
      select: () => ({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: () => ({
                limit: () => ({
                  single: () => Promise.resolve({
                    data: { id: 'otp-1', expires_at: expiredDate },
                    error: null,
                  }),
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
      body: JSON.stringify({ phone: '+79241716122', code: '1234' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/истёк/);
  });

  it('verifies OTP and returns session for existing user', async () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'otp_codes' && callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({
                        data: { id: 'otp-1', expires_at: futureDate },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          update: mockUpdate,
        };
      }
      if (table === 'otp_codes') {
        return { update: mockUpdate };
      }
      // profiles table
      return {
        select: () => ({
          eq: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({
                data: { id: 'user-123' },
                error: null,
              }),
            }),
          }),
        }),
      };
    });

    mockAdminAuth.admin.getUserById.mockResolvedValue({
      data: { user: { email: '79241716122@phone.altech.local' } },
    });
    mockAdminAuth.admin.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'token-abc' } },
      error: null,
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const req = new Request('http://localhost/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+79241716122', code: '1234' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isNewUser).toBe(false);
    expect(body.userId).toBe('user-123');
    expect(body.token_hash).toBe('token-abc');
  });

  it('creates new user when phone not found in profiles', async () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'otp_codes' && callCount === 0) {
        callCount++;
        return {
          select: () => ({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: () => ({
                    limit: () => ({
                      single: () => Promise.resolve({
                        data: { id: 'otp-1', expires_at: futureDate },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          update: mockUpdate,
        };
      }
      if (table === 'otp_codes') {
        return { update: mockUpdate };
      }
      // profiles — user not found
      return {
        select: () => ({
          eq: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      };
    });

    mockAdminAuth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-user-456' } },
      error: null,
    });
    mockAdminAuth.admin.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'token-new' } },
      error: null,
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const req = new Request('http://localhost/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '89141082051', code: '1234' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isNewUser).toBe(true);
    expect(body.userId).toBe('new-user-456');
  });
});

// ─── sms.ts unit tests ──────────────────────────────────────

describe('generateOtpCode', () => {
  it('generates 4-digit code', async () => {
    const { generateOtpCode } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{4}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(1000);
    expect(Number(code)).toBeLessThanOrEqual(9999);
  });

  it('generates different codes (not constant)', async () => {
    const { generateOtpCode } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const codes = new Set(Array.from({ length: 20 }, () => generateOtpCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('sendSms', () => {
  it('returns true in dev mode without SMS_RU_API_KEY', async () => {
    const { sendSms } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const result = await sendSms('79241716122', 'Test message');
    expect(result).toBe(true);
  });

  it('normalizes phone in sendSms', async () => {
    const { sendSms } = await vi.importActual<typeof import('@/lib/sms')>('@/lib/sms');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await sendSms('+7 (924) 171-61-22', 'Test');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('79241716122')
    );
    consoleSpy.mockRestore();
  });
});
