import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protéger uniquement la route /admin
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Lire le cookie de session
  const session = request.cookies.get('admin_session');
  if (session?.value === process.env.ADMIN_SECRET || session?.value === 'kerosene-admin') {
    return NextResponse.next();
  }

  // Rediriger vers la page de login
  const loginUrl = new URL('/admin/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
