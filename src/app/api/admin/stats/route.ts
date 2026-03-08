import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const payload = await getSession();
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const totalUsers = await prisma.user.count();

        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);

        const activeUsersCount = await prisma.user.count({
            where: {
                mcq_sessions: {
                    some: {
                        started_at: { gte: recentDate }
                    }
                }
            }
        });

        const newUsersLast7Days = await prisma.user.count({
            where: {
                created_at: { gte: recentDate }
            }
        });

        // Get all completed sessions
        const allSessions = await prisma.mcqSession.findMany({
            where: { score: { not: null } },
            select: {
                score: true,
                answers: {
                    select: { is_critical_miss: true }
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

        // Recent sessions (last 10)
        const recentSessions = await prisma.mcqSession.findMany({
            where: { completed_at_optional: { not: null } },
            orderBy: { started_at: 'desc' },
            take: 10,
            select: {
                id: true,
                scenario_id: true,
                score: true,
                started_at: true,
                user: {
                    select: { display_name: true, district: true }
                }
            }
        });

        // At-risk workers: avg score < 50 or critical misses > 3
        const usersWithStats = await prisma.user.findMany({
            where: { role: 'user' },
            select: {
                id: true,
                display_name: true,
                district: true,
                mcq_sessions: {
                    where: { score: { not: null } },
                    select: {
                        score: true,
                        answers: { select: { is_critical_miss: true } }
                    }
                }
            }
        });

        const atRiskWorkers = usersWithStats
            .map(user => {
                const sessions = user.mcq_sessions;
                if (sessions.length === 0) return null;
                const avgScore = Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length);
                const criticalMisses = sessions.reduce((sum, s) => sum + s.answers.filter(a => a.is_critical_miss).length, 0);
                if (avgScore < 50 || criticalMisses > 3) {
                    return {
                        id: user.id,
                        name: user.display_name || 'Anonymous',
                        district: user.district || 'Unassigned',
                        avgScore,
                        criticalMisses,
                        totalSessions: sessions.length,
                    };
                }
                return null;
            })
            .filter(Boolean)
            .slice(0, 10);

        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsersLast7Days: activeUsersCount,
                newUsersLast7Days,
                totalScenariosTaken,
                averageSystemScore,
                totalCriticalMisses,
                recentSessions: recentSessions.map(s => ({
                    id: s.id,
                    scenarioId: s.scenario_id,
                    score: s.score,
                    date: s.started_at,
                    workerName: s.user?.display_name || 'Anonymous',
                    workerDistrict: s.user?.district || 'Unassigned',
                })),
                atRiskWorkers,
            }
        });
    } catch (error) {
        console.error('Admin stats API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
