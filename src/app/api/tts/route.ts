import { NextResponse } from 'next/server';

// Fish Audio TTS endpoint
const FISH_AUDIO_URL = 'https://api.fish.audio/v1/tts';

// Default voice reference IDs per language (Fish Audio public voices)
const VOICE_MAP: Record<string, string> = {
    'en': process.env.FISH_VOICE_EN || 'ad024def0a50487ab6bbdd59c8c42fbb', // English
    'hi': process.env.FISH_VOICE_HI || 'ad024def0a50487ab6bbdd59c8c42fbb', // Hindi (same fallback)
    'mr': process.env.FISH_VOICE_MR || 'ad024def0a50487ab6bbdd59c8c42fbb', // Marathi (same fallback)
};

export async function POST(request: Request) {
    try {
        const apiKey = process.env.FISH_AUDIO_API_KEY;
        if (!apiKey) {
            // Fallback: tell client to use browser TTS
            return NextResponse.json({ error: 'TTS not configured' }, { status: 503 });
        }

        const { text, language } = await request.json();
        if (!text) {
            return NextResponse.json({ error: 'text is required' }, { status: 400 });
        }

        const referenceId = VOICE_MAP[language] || VOICE_MAP['en'];

        const response = await fetch(FISH_AUDIO_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                reference_id: referenceId,
                format: 'mp3',
                speed: 1.0,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Fish Audio error:', err);
            return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
        }

        // Stream the audio binary back to the client
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=3600', // cache TTS for 1hr
            },
        });
    } catch (error) {
        console.error('TTS route error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
