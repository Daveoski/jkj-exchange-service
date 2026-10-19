import { NextResponse, type NextRequest } from 'next/server';

// Fast redirect for signed-out visitors. The API still verifies every request; this only
// avoids flashing the dashboard shell to someone without a session cookie.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== '/admin/login' && !request.cookies.has('jkj_admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    const inquiry = request.nextUrl.searchParams.get('inquiry');
    if (inquiry) url.searchParams.set('next', `/admin?inquiry=${inquiry}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin', '/admin/((?!login).*)'] };
