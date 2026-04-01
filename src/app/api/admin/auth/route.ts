import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminSecret = process.env.ADMIN_PASSWORD || 'kerosene2026';

  if (password === adminSecret) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', process.env.ADMIN_SECRET || 'kerosene-admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
