// app/api/check-auth/route.js
import { cookies } from 'next/headers';

// 存储用户信息的简单缓存（生产环境应使用数据库）
const tokenCache = new Map();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('google_refresh_token')?.value;
    const accessToken = cookieStore.get('google_access_token')?.value;

    if (!refreshToken && !accessToken) {
      return Response.json({
        authorized: false,
      });
    }

    // 先从缓存中获取用户邮箱
    let userEmail = tokenCache.get('user_email');

    // 如果缓存中没有，尝试用 access token 重新获取用户信息
    if (!userEmail && accessToken) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          userEmail = userInfo.email;
          // 保存到缓存
          tokenCache.set('user_email', userEmail);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    }

    return Response.json({
      authorized: true,
      email: userEmail || null, // 無法取得時返回 null
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return Response.json(
      { authorized: false },
      { status: 500 }
    );
  }
}
