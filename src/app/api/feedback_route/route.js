import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { type } = await request.json();

    const prompt =
      type === 'deeper'
        ? 'Generate a deep and thoughtful icebreaker question for a group. just give only the question.'
        : type === 'easier'
        ? 'Generate a light and fun icebreaker question. just give only the question.'
        : 'Generate a creative, interesting question for people to connect. just give only the question.';

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates fun, insightful icebreaker questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }

    const data = await response.json();
    const generated = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ newQuestion: generated || 'No question generated.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

