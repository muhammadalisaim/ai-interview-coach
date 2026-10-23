import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Optional Whisper transcription endpoint placeholder
  // When an audio file is uploaded, this can forward to Whisper API or return mock text
  return NextResponse.json({
    text: 'I am excited about this role and ready to contribute to the engineering team.',
  });
}
