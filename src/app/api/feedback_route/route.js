import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to format questions consistently
const formatQuestion = (question) => {
  return question
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim()                      // Remove leading/trailing whitespace
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .replace(/[.?!]+$/, '?');    // Ensure question ends with a single question mark
};

// Simple utility to pick a random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request) {
  try {
    const { questionBank, currentQuestion, type } = await request.json();

    // 1) If user selected "random," we just pick from the local bank
    if (type === 'random') {
      const randomQ = pickRandom(questionBank);
      const newQuestion = formatQuestion(randomQ || 'What is your favorite color?');
      return NextResponse.json({ newQuestion });
    }

    // 2) If user clicked "easier" or "deeper," we call GPT
    //    and use your old system prompts for simpler vs deeper
    const systemPrompt =
      type === 'easier'
        ? "You are a helpful assistant that generates simpler icebreaker questions. Generate a single question that is simpler than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text. Use proper grammar and capitalization."
        : "You are a helpful assistant that generates deeper icebreaker questions. Generate a single question that is more thought-provoking than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text. Use proper grammar and capitalization.";

    // Build the user message so GPT knows which question is considered complex or simple
    const userMessage =
      type === 'easier'
        ? `The following question was considered too complex: "${currentQuestion}". Please generate a simpler alternative.`
        : `The following question was considered too simple: "${currentQuestion}". Please generate a deeper alternative.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Grab GPT's raw output, then apply your formatting function
    const rawGPTResponse = completion.choices[0]?.message?.content || '';
    const newQuestion = formatQuestion(rawGPTResponse);

    return NextResponse.json({ newQuestion }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Feedback Error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
