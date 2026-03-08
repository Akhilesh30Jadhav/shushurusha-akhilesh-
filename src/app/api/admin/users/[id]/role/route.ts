import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await getSession();
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const { role } = await request.json();

        if (!role || !['user', 'admin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role. Must be "user" or "admin".' }, { status: 400 });
        }

        // Prevent demoting yourself
        if (id === payload.userId && role !== 'admin') {
            return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, display_name: true, role: true },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Role update API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
