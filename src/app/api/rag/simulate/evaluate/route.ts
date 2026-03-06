import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Expected from client: { scenario: string, user_choice: string, correct_option: string, context: string }
        const res = await fetch('http://localhost:8000/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Python API Error: ${err}`);
        }

        const data = await res.json();

        // Convert Python response: { "feedback": "...", "passed": true/false }
        return NextResponse.json({
            success: true,
            feedback: data.feedback,
            is_correct: data.passed
        });
    } catch (error: any) {
        console.error('Failed to proxy to Python RAG Evaluate API:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to evaluate response via the RAG engine.' },
            { status: 500 }
        );
    }
}
