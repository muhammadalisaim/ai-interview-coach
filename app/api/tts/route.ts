import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    // Clean text and limit to spoken question length
    const cleanText = text.trim().slice(0, 400);
    const encoded = encodeURIComponent(cleanText);
    const lang = searchParams.get('lang') || 'en';

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'audio/mpeg,audio/*;q=0.9',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream TTS error' }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error('TTS handler error:', err);
    return NextResponse.json({ error: err.message || 'TTS processing error' }, { status: 500 });
  }
}
