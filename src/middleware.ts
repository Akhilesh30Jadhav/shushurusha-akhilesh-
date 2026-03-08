import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-super-secret-key-for-dev';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow admin login page without auth
    if (pathname === '/admin/login') {
        // If already logged in as admin, redirect to admin dashboard
        const session = request.cookies.get('session')?.value;
        if (session) {
            try {
                const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
                if (payload.role === 'admin') {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
            } catch {
                // Invalid token, let them stay on login page
            }
        }
        return NextResponse.next();
    }

    const session = request.cookies.get('session')?.value;

    if (!session) {
        // Redirect admin routes to admin login, others to regular login
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });

        // For admin routes, check role
        if (pathname.startsWith('/admin')) {
            if (payload.role !== 'admin') {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        // Invalid or expired token, clear it and redirect
        const redirectUrl = pathname.startsWith('/admin') ? '/admin/login' : '/auth/login';
        const res = NextResponse.redirect(new URL(redirectUrl, request.url));
        res.cookies.set('session', '', { expires: new Date(0) });
        return res;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/scenario/:path*', '/report/:path*', '/profile/:path*', '/leaderboard/:path*', '/admin/:path*'],
};
