import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { loginSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, phone, password, language, district } = await request.json();

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create the user
        const user = await prisma.user.create({
            data: {
                display_name: name,
                email: email || null,
                phone: phone || null,
                password_hash,
                language: language || 'en',
                district: district || null,
            },
        });

        // Sign the JWT cookie session
        await loginSession(user.id, user.role);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.display_name } });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 });
        }
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
