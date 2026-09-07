// app/api/auth/google/route.js
export async function GET(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = 'https://www.googleapis.com/auth/drive.file';

  // 從查詢參數取得 returnTo 路徑
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get('returnTo') || '/';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline', // 請求 refresh token
    prompt: 'consent', // 強制顯示授權屏幕
    state: returnTo, // 使用 state 參數保存原始頁面
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return Response.redirect(url);
}
