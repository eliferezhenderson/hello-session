// src/app/api/feedback_route/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { question, feedback } = await request.json();

    // Only generate new question if feedback is 'dislike' (too complex)
    if (feedback === 'dislike') {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates icebreaker questions. Generate a single question that is simpler than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text."
          },
          {
            role: "user",
            content: `The following question was considered too complex: "${question}". Please generate a simpler alternative.`
          }
        ],
        model: "gpt-3.5-turbo",
      });

      const newQuestion = completion.choices[0].message.content.trim();

      return new NextResponse(
        JSON.stringify({ newQuestion }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // If feedback is 'like', just return success
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: 'Thank you for your feedback!'
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Feedback Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process feedback' }), 
      { status: 500 }
    );
  }
}