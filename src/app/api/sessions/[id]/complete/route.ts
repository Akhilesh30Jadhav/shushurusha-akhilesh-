import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: session_id } = await params;

        // Verify session
        const session = await prisma.session.findUnique({
            where: { id: session_id },
            include: { turns: true, scenario: true }
        });

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // Generate Report
        let totalItems = 0;
        let totalMatched = 0;
        const allChecklistResults: any[] = [];
        const allCriticalMisses: any[] = [];

        // Evaluate aggregated turns
        for (const turn of session.turns) {
            const matched = JSON.parse(turn.matched_items_json);
            const missed = JSON.parse(turn.missed_items_json);
            const criticalMissed = JSON.parse(turn.critical_missed_json);

            totalItems += matched.length + missed.length;
            totalMatched += matched.length;

            matched.forEach((m: any) => allChecklistResults.push({ ...m, passed: true, turn_id: turn.id }));
            missed.forEach((m: any) => allChecklistResults.push({ ...m, passed: false, turn_id: turn.id }));
            criticalMissed.forEach((m: any) => allCriticalMisses.push({ ...m, passed: false, turn_id: turn.id }));
        }

        const score = totalItems > 0 ? Math.round((totalMatched / totalItems) * 100) : 0;

        // Calculate suggestions based on the newly introduced `end_report_template`
        let suggestions: string[] = [];
        const endReportTemplateStr = session.scenario.end_report_template_json;
        if (endReportTemplateStr) {
            try {
                const reportTemplate = JSON.parse(endReportTemplateStr);
                if (reportTemplate.suggestion_bank) {
                    allCriticalMisses.forEach((cm: any) => {
                        const applicableSugs = reportTemplate.suggestion_bank.filter((b: any) => b.when_missed.includes(cm.id));
                        applicableSugs.forEach((app: any) => {
                            suggestions = [...suggestions, ...app.suggestions];
                        });
                    });
                }

                // Fallback suggestions based on basic critical misses
                if (suggestions.length === 0 && allCriticalMisses.length > 0) {
                    suggestions.push("Always ask about critical danger signs immediately.");
                }
            } catch (e) {
                console.error("Error parsing report template", e);
            }
        }

        if (suggestions.length === 0) {
            suggestions.push("Great job following protocol closely!");
        }

        // Generate Textual Report from Python AI
        let report_text = null;
        try {
            const pyRes = await fetch('http://localhost:8000/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: score,
                    critical_misses: allCriticalMisses,
                    suggestions: suggestions
                })
            });
            if (pyRes.ok) {
                const pyData = await pyRes.json();
                report_text = pyData.report;
            }
        } catch (error) {
            console.error('Failed to generate AI report:', error);
        }

        // Mark completed
        await prisma.session.update({
            where: { id: session_id },
            data: {
                completed_at_optional: new Date(),
                score_optional: score,
                report_json: report_text ? JSON.stringify({ text: report_text }) : null
            }
        });

        return NextResponse.json({
            report: {
                score,
                checklist_results: allChecklistResults,
                critical_misses: allCriticalMisses,
                suggestions,
                transcript: session.turns.map(t => ({ node_key: t.node_key, user_text: t.user_text }))
            }
        });

    } catch (error) {
        console.error('Error completing session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
