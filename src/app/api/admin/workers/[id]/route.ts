import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await getSession();
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                display_name: true,
                email: true,
                phone: true,
                district: true,
                language: true,
                created_at: true,
                mcq_sessions: {
                    orderBy: { started_at: 'desc' },
                    select: {
                        id: true,
                        scenario_id: true,
                        score: true,
                        started_at: true,
                        answers: {
                            select: { is_critical_miss: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const sessions = user.mcq_sessions.map(s => ({
            id: s.id,
            scenarioId: s.scenario_id,
            score: s.score,
            date: s.started_at,
            criticalMisses: s.answers.filter(a => a.is_critical_miss).length,
        }));

        return NextResponse.json({
            worker: { sessions }
        });
    } catch (error) {
        console.error('Worker detail API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
