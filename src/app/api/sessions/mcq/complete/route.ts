import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const authSession = await getSession();
        if (!authSession || !authSession.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenarioId, answers, startTime, score } = await request.json();

        const criticalMisses = answers.filter((a: any) => a.is_critical_miss).map((a: any) => ({ text: `Missed critical question ${a.question_id}` }));

        // Generate Textual Report from Python AI
        let report_text = null;
        try {
            const pyRes = await fetch('http://localhost:8000/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: score || 0,
                    critical_misses: criticalMisses,
                    suggestions: []
                })
            });
            if (pyRes.ok) {
                const pyData = await pyRes.json();
                report_text = pyData.report;
            }
        } catch (error) {
            console.error('Failed to generate AI report for MCQ:', error);
        }

        // Create the MCQ Session
        const mcqSession = await prisma.mcqSession.create({
            data: {
                user_id: authSession.userId,
                scenario_id: scenarioId,
                started_at: new Date(startTime),
                completed_at_optional: new Date(),
                score: score,
                report_json: report_text ? JSON.stringify({ text: report_text }) : null,
                answers: {
                    create: answers.map((a: any) => ({
                        question_id: a.question_id,
                        selected_option_id: a.selected_option_id,
                        is_correct: a.is_correct,
                        is_critical_miss: a.is_critical_miss
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, sessionId: mcqSession.id });
    } catch (error) {
        console.error('Error completing MCQ session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
