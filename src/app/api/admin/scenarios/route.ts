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

        // Get all MCQ sessions grouped by scenario_id
        const allSessions = await prisma.mcqSession.findMany({
            where: { score: { not: null } },
            select: {
                scenario_id: true,
                score: true,
                answers: {
                    select: { is_critical_miss: true }
                }
            }
        });

        const scenarioMap: Record<string, { totalScore: number; count: number; criticalMisses: number }> = {};

        allSessions.forEach(session => {
            const sid = session.scenario_id;
            if (!scenarioMap[sid]) scenarioMap[sid] = { totalScore: 0, count: 0, criticalMisses: 0 };
            scenarioMap[sid].totalScore += (session.score || 0);
            scenarioMap[sid].count++;
            scenarioMap[sid].criticalMisses += session.answers.filter(a => a.is_critical_miss).length;
        });

        const scenarios = Object.entries(scenarioMap).map(([id, data]) => ({
            id,
            timesCompleted: data.count,
            avgScore: Math.round(data.totalScore / data.count),
            criticalMissRate: data.count > 0 ? Math.round((data.criticalMisses / data.count) * 100) / 100 : 0,
        })).sort((a, b) => b.timesCompleted - a.timesCompleted);

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('Admin scenarios API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
