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

        // Score Distribution
        const allUsers = await prisma.user.findMany({
            where: { role: 'user' },
            select: {
                id: true,
                district: true,
                mcq_sessions: {
                    where: { score: { not: null } },
                    select: {
                        score: true,
                        scenario_id: true,
                        started_at: true,
                        answers: {
                            select: { is_critical_miss: true, question_id: true }
                        }
                    }
                }
            }
        });

        // Score distribution buckets
        const scoreDistribution = { '0-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
        const districtMap: Record<string, { totalScore: number; count: number }> = {};
        const scenarioMap: Record<string, { totalScore: number; count: number; criticalMisses: number }> = {};
        const criticalMissQuestions: Record<string, number> = {};

        let thisWeekSessions = 0;
        let lastWeekSessions = 0;
        let thisWeekScore = 0;
        let lastWeekScore = 0;
        let thisWeekCount = 0;
        let lastWeekCount = 0;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        allUsers.forEach(user => {
            const sessions = user.mcq_sessions;
            if (sessions.length === 0) return;

            const avgScore = Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length);

            if (avgScore < 40) scoreDistribution['0-40']++;
            else if (avgScore < 60) scoreDistribution['40-60']++;
            else if (avgScore < 80) scoreDistribution['60-80']++;
            else scoreDistribution['80-100']++;

            // District aggregation
            const district = user.district || 'Unassigned';
            if (!districtMap[district]) districtMap[district] = { totalScore: 0, count: 0 };
            districtMap[district].totalScore += avgScore;
            districtMap[district].count++;

            sessions.forEach(session => {
                // Scenario aggregation
                const sid = session.scenario_id;
                if (!scenarioMap[sid]) scenarioMap[sid] = { totalScore: 0, count: 0, criticalMisses: 0 };
                scenarioMap[sid].totalScore += (session.score || 0);
                scenarioMap[sid].count++;
                scenarioMap[sid].criticalMisses += session.answers.filter(a => a.is_critical_miss).length;

                // Critical miss breakdown
                session.answers.filter(a => a.is_critical_miss).forEach(a => {
                    criticalMissQuestions[a.question_id] = (criticalMissQuestions[a.question_id] || 0) + 1;
                });

                // Weekly trends
                const sessionDate = new Date(session.started_at);
                if (sessionDate >= oneWeekAgo) {
                    thisWeekSessions++;
                    thisWeekScore += (session.score || 0);
                    thisWeekCount++;
                } else if (sessionDate >= twoWeeksAgo) {
                    lastWeekSessions++;
                    lastWeekScore += (session.score || 0);
                    lastWeekCount++;
                }
            });
        });

        const districtPerformance = Object.entries(districtMap)
            .map(([name, data]) => ({
                name,
                avgScore: Math.round(data.totalScore / data.count),
                workerCount: data.count,
            }))
            .sort((a, b) => b.avgScore - a.avgScore);

        const scenarioPerformance = Object.entries(scenarioMap)
            .map(([id, data]) => ({
                id,
                avgScore: Math.round(data.totalScore / data.count),
                timesCompleted: data.count,
                criticalMisses: data.criticalMisses,
            }))
            .sort((a, b) => a.avgScore - b.avgScore);

        const criticalMissBreakdown = Object.entries(criticalMissQuestions)
            .map(([questionId, count]) => ({ questionId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const weeklyTrends = {
            thisWeek: {
                sessions: thisWeekSessions,
                avgScore: thisWeekCount > 0 ? Math.round(thisWeekScore / thisWeekCount) : 0,
            },
            lastWeek: {
                sessions: lastWeekSessions,
                avgScore: lastWeekCount > 0 ? Math.round(lastWeekScore / lastWeekCount) : 0,
            },
        };

        return NextResponse.json({
            scoreDistribution,
            districtPerformance,
            scenarioPerformance,
            weeklyTrends,
            criticalMissBreakdown,
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
