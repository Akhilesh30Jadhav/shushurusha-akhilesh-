import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const payload = await getSession();
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Aggregate high-level stats system-wide
        const totalUsers = await prisma.user.count();

        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7); // Active in last 7 days

        // Count users who have taken a scenario in the last 7 days
        const activeUsersCount = await prisma.user.count({
            where: {
                mcq_sessions: {
                    some: {
                        started_at: {
                            gte: recentDate
                        }
                    }
                }
            }
        });

        // Get all completed sessions to calculate averages
        const allSessions = await prisma.mcqSession.findMany({
            where: {
                score: {
                    not: null
                }
            },
            select: {
                score: true,
                answers: {
                    select: {
                        is_critical_miss: true
                    }
                }
            }
        });

        const totalScenariosTaken = allSessions.length;

        let totalSystemScore = 0;
        let totalCriticalMisses = 0;

        allSessions.forEach(session => {
            totalSystemScore += (session.score || 0);
            totalCriticalMisses += session.answers.filter(a => a.is_critical_miss).length;
        });

        const averageSystemScore = totalScenariosTaken > 0 ? Math.round(totalSystemScore / totalScenariosTaken) : 0;
        const avgScenariosPerUser = totalUsers > 0 ? (totalScenariosTaken / totalUsers).toFixed(1) : 0;

        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsersLast7Days: activeUsersCount,
                totalScenariosTaken,
                averageSystemScore,
                avgScenariosPerUser,
                totalCriticalMisses
            }
        });

    } catch (error) {
        console.error('Admin stats API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
