// app/api/auth/callback/route.js
import { cookies } from 'next/headers';

// 簡單的內存缓存存儲 token（用於演示，生産環境應使用數據庫）
const tokenCache = new Map();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return Response.json(
        { error: '缺少授權代碼' },
        { status: 400 }
      );
    }

    // 用授權代碼換取 access token 和 refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      return Response.json(
        { error: '無法獲取 token' },
        { status: 500 }
      );
    }

    const tokens = await tokenResponse.json();

    // 存儲 refresh token 到 HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('google_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 年
      path: '/',
    });

    // 也在內存中存儲（為了快速訪問）
    tokenCache.set('refresh_token', tokens.refresh_token);
    tokenCache.set('access_token', tokens.access_token);
    tokenCache.set('expires_at', Date.now() + tokens.expires_in * 1000);

    // 重定向回前端，通知授權成功
    const returnUrl = new URL(req.url);
    returnUrl.pathname = '/school-info';
    returnUrl.search = '?auth=success';

    return Response.redirect(returnUrl.toString());
  } catch (error) {
    console.error('Auth callback error:', error);
    return Response.json(
      { error: error.message || '認證失敗' },
      { status: 500 }
    );
  }
}

export function getStoredTokens() {
  return {
    refreshToken: tokenCache.get('refresh_token'),
    accessToken: tokenCache.get('access_token'),
    expiresAt: tokenCache.get('expires_at'),
  };
}

export function setStoredTokens(refreshToken, accessToken, expiresIn) {
  tokenCache.set('refresh_token', refreshToken);
  tokenCache.set('access_token', accessToken);
  tokenCache.set('expires_at', Date.now() + expiresIn * 1000);
}
