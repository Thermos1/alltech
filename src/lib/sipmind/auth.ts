import { NextRequest } from 'next/server';

export function verifySipmindAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const secret = process.env.SIPMIND_API_SECRET;

  if (!secret) return false;
  return token === secret;
}
