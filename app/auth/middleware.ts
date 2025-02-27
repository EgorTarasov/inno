import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });
    const { pathname } = req.nextUrl;

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        if (token.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Moderator or admin routes
    if (pathname.startsWith('/moderator')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        if (token.role !== 'admin' && token.role !== 'moderator') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Protected routes for all authenticated users
    if (pathname.startsWith('/profile')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Redirect logged in users from auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (token) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/moderator/:path*', '/profile/:path*', '/login', '/register']
};