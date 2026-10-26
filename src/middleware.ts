import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para garantizar que la pantalla inicial sea siempre /login
 * cuando el usuario no tiene una sesión autenticada activa.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('poc_lms_user_id')?.value;
  const { pathname } = request.nextUrl;

  // Si no está autenticado y visita la raíz (/), redirigir directamente a /login
  if (!sessionCookie && pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si intenta acceder a rutas de lecciones sin haber iniciado sesión, redirigir a /login
  if (!sessionCookie && pathname.startsWith('/lessons')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/lessons/:path*'],
};
