import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                display_name: true,
                language: true,
                district: true,
                email: true,
                phone: true,
                mcq_sessions: {
                    select: {
                        score: true,
                        answers: {
                            select: {
                                is_critical_miss: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate Gamification Stats
        const completedScenarios = user.mcq_sessions.filter(s => s.score !== null);
        const totalScenariosPassed = completedScenarios.filter(s => (s.score || 0) >= 80).length;

        // Critical saves -> let's say it's scenarios where score is > 0 and no critical miss
        let criticalSavesLogged = 0;
        completedScenarios.forEach(s => {
            const hasCriticalMiss = s.answers.some(a => a.is_critical_miss);
            if (!hasCriticalMiss) criticalSavesLogged++;
        });

        const badges = [];
        if (completedScenarios.length >= 1) badges.push({ id: 'first_steps', name: 'First Steps', icon: 'Footprints', desc: 'Completed 1st Scenario' });
        if (totalScenariosPassed >= 5) badges.push({ id: 'competent', name: 'Competent Care', icon: 'Medal', desc: 'Passed 5 Scenarios' });
        if (totalScenariosPassed >= 10) badges.push({ id: 'master', name: 'Protocol Master', icon: 'Trophy', desc: 'Passed 10 Scenarios' });
        if (criticalSavesLogged >= 5) badges.push({ id: 'lifesaver', name: 'Lifesaver', icon: 'HeartPulse', desc: '5 Flawless Scenarios' });

        return NextResponse.json({
            user: {
                id: user.id,
                display_name: user.display_name,
                language: user.language,
                district: user.district,
                email: user.email,
                phone: user.phone,
                stats: {
                    totalScenariosPassed,
                    criticalSavesLogged
                },
                badges
            }
        });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
