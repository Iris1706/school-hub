// app/api/check-auth/route.js
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    return Response.json({
      authorized: !!refreshToken,
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return Response.json(
      { authorized: false },
      { status: 500 }
    );
  }
}
