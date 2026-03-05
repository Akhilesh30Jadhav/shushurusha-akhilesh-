import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const payload = await getSession();
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const leaderboardData = await prisma.user.findMany({
            select: {
                id: true,
                display_name: true,
                mcq_sessions: {
                    select: {
                        score: true
                    }
                }
            }
        });

        const rankedUsers = leaderboardData.map(user => {
            const totalScore = user.mcq_sessions.reduce((sum, session) => sum + (session.score || 0), 0);
            const scenariosCompleted = user.mcq_sessions.filter(s => s.score !== null).length;

            return {
                id: user.id,
                name: user.display_name || 'Anonymous Worker',
                totalScore,
                scenariosCompleted
            };
        }).sort((a, b) => b.totalScore - a.totalScore);

        const top50 = rankedUsers.slice(0, 50);

        return NextResponse.json({ leaderboard: top50 });

    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
