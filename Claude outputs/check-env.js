// pages/api/check-env.js - 診斷工具（完成後刪除）
export async function GET() {
  const vars = {
    GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
    GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
  };

  // 檢查 PRIVATE_KEY 格式
  const pk = process.env.GOOGLE_PRIVATE_KEY || '';
  const pkInfo = {
    exists: !!pk,
    startsCorrect: pk.startsWith('-----BEGIN'),
    endsCorrect: pk.endsWith('-----'),
    length: pk.length,
    hasNewlines: pk.includes('\n'),
  };

  return Response.json({ env: vars, privateKey: pkInfo });
}
