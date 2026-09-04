// app/api/auth/logout/route.js
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 删除 refresh token cookie
    cookieStore.delete('google_refresh_token');

    return Response.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: error.message || '登出失敗' },
      { status: 500 }
    );
  }
}
