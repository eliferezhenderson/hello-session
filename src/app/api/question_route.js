import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { question, feedback } = await request.json();

    // Only generate a new question if the feedback is negative
    if (feedback === 'dislike') {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates icebreaker questions. Generate a single question that is simpler than the given question while maintaining the same theme or topic."
          },
          {
            role: "user",
            content: `The following question was considered too complex: "${question}". Please generate a simpler alternative.`
          }
        ],
        model: "gpt-3.5-turbo",
      });

      const newQuestion = completion.choices[0].message.content.replace(/^["']|["']$/g, '');
      return NextResponse.json({ newQuestion });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 });
  }
}