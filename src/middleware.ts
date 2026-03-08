import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-super-secret-key-for-dev';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });

        // For admin routes, check role
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (payload.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        // Invalid or expired token, clear it and redirect
        const res = NextResponse.redirect(new URL('/auth/login', request.url));
        res.cookies.set('session', '', { expires: new Date(0) });
        return res;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/scenario/:path*', '/report/:path*', '/profile/:path*', '/leaderboard/:path*', '/admin/:path*'],
};
