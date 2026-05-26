import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const user = await getSessionUserFromCookies();
  return NextResponse.json({ user: user ?? null });
}
