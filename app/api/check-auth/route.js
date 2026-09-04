// app/api/check-auth/route.js
import { cookies } from 'next/headers';

// 存储用户信息的简单缓存（生产环境应使用数据库）
const tokenCache = new Map();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!refreshToken) {
      return Response.json({
        authorized: false,
      });
    }

    // 从缓存中获取用户邮箱
    const userEmail = tokenCache.get('user_email');

    return Response.json({
      authorized: true,
      email: userEmail,
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return Response.json(
      { authorized: false },
      { status: 500 }
    );
  }
}
