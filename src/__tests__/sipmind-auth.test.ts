import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifySipmindAuth } from '@/lib/sipmind/auth';

describe('verifySipmindAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, SIPMIND_API_SECRET: 'test-secret-123' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns true for valid Bearer token', () => {
    const req = new NextRequest('http://localhost/api/sipmind/test', {
      headers: { Authorization: 'Bearer test-secret-123' },
    });
    expect(verifySipmindAuth(req)).toBe(true);
  });

  it('returns false for invalid token', () => {
    const req = new NextRequest('http://localhost/api/sipmind/test', {
      headers: { Authorization: 'Bearer wrong-token' },
    });
    expect(verifySipmindAuth(req)).toBe(false);
  });

  it('returns false for missing Authorization header', () => {
    const req = new NextRequest('http://localhost/api/sipmind/test');
    expect(verifySipmindAuth(req)).toBe(false);
  });

  it('returns false when SIPMIND_API_SECRET is not set', () => {
    delete process.env.SIPMIND_API_SECRET;
    const req = new NextRequest('http://localhost/api/sipmind/test', {
      headers: { Authorization: 'Bearer test-secret-123' },
    });
    expect(verifySipmindAuth(req)).toBe(false);
  });

  it('returns false for non-Bearer auth', () => {
    const req = new NextRequest('http://localhost/api/sipmind/test', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(verifySipmindAuth(req)).toBe(false);
  });
});
