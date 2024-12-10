import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const response = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
            method: 'GET',
            headers: { 'user-id': userId }
        });

        if (!response.ok) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const data = await response.json();

        if (!data.isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in middleware', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    mather: '/documents/:path*'
}