import { SafeUser } from '@/lib/types';
import { cookies } from 'next/headers';

import { getUserById } from '@/lib/storage';
import { getSessionUserIdFromToken, SESSION_COOKIE_NAME } from '@/lib/session';

export async function getSessionUserFromCookies(): Promise<SafeUser | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const userId = getSessionUserIdFromToken(token);

  if (!userId) {
    return null;
  }

  return (await getUserById(userId)) ?? null;
}
