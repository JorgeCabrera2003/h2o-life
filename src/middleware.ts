import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // En producción detrás de proxys o CDN (Cloudflare, Vercel, Nginx), forzar HTTPS si viene por HTTP
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');

  if (process.env.NODE_ENV === 'production' && proto === 'http' && host) {
    const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, 301);
  }

  const response = NextResponse.next();
  // Aplicar HSTS SOLO en producción cuando la conexión es efectivamente HTTPS
  if (process.env.NODE_ENV === 'production' && proto === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  } else {
    // En desarrollo local o Wi-Fi deshabilitar HSTS explícitamente para permitir descargas HTTP de scripts
    response.headers.set('Strict-Transport-Security', 'max-age=0');
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
