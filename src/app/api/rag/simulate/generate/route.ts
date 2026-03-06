import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Expects { topic: string, difficulty: number }
        const res = await fetch('http://localhost:8000/generate', {
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
        
        // Convert the python engine format to the one expected by our frontend components
        // Python format: { "scenario": "...", "options": {"A": "...", ...}, "correct_option": "A", "context": "..." }
        const formattedQuestion = {
            question_id: `Q_${Date.now()}`,
            patient_prompt: data.scenario,
            mcq_question: "What is your next step according to protocol?",
            options: Object.entries(data.options).map(([key, val]) => ({
                option_id: key,
                text: val as string
            })),
            correct_option_id: data.correct_option,
            critical: false, // Default logic
            python_context: data.context // Store context for evaluation
        };

        return NextResponse.json({
            success: true,
            question: formattedQuestion,
            rawContext: data.context
        });
    } catch (error: any) {
        console.error('Failed to proxy to Python RAG Generate API:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate a scenario via the RAG engine.' },
            { status: 500 }
        );
    }
}
