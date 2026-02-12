import { NextRequest, NextResponse } from 'next/server';

import { getSessionUserFromCookies } from '@/lib/auth';
import { getUsers } from '@/lib/storage';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionUser = await getSessionUserFromCookies();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get('query')?.trim().toLowerCase() ?? '';

    if (!query) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const users = await getUsers();

    const results = users
      .filter((user) => user.name.toLowerCase().includes(query))
      .slice(0, 10)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email
      }));

    return NextResponse.json({ users: results }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to search travelers right now.' }, { status: 500 });
  }
}
