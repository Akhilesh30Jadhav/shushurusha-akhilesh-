import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { loginSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, phone, password } = await request.json();

        if ((!email && !phone) || !password) {
            return NextResponse.json({ error: 'Credentials and password required' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: email ? { email } : { phone },
        });

        if (!user || !user.password_hash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Sign the JWT cookie session
        await loginSession(user.id, user.role);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.display_name, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
