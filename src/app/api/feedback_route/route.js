import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1) Import your single source of truth for the question bank:
import questions from '../../questions.js'; 
// If you placed it differently, adjust the import path accordingly.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2) Helper function to format questions consistently
const formatQuestion = (question) => {
  return question
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim()                      // Remove leading/trailing whitespace
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .replace(/[.?!]+$/, '?');    // Ensure question ends with a single '?'
};

// 3) Build a System Prompt that includes your entire question bank
function buildSystemPrompt(type) {
  // Convert your array of questions to a bullet-list or joined string
  const bankList = questions
    .map((q, i) => `(${i + 1}) ${q}`)
    .join('\n');

  if (type === 'random') {
    return `You have the following question bank:\n\n${bankList}\n\nThe user wants a random icebreaker question. Decide whether to pick one from the bank or generate a brand-new question in a similar style. Return ONLY the question in plain text, with no quotes or extra commentary. Use proper grammar and punctuation.`;
  } else if (type === 'easier') {
    return `You have the following question bank:\n\n${bankList}\n\nThe user wants a simpler, easier icebreaker question. Decide whether to pick one from the bank or generate a brand-new simpler question in a similar style. Return ONLY the question in plain text, with no quotes or extra commentary. Use proper grammar and punctuation.`;
  } else {
    // 'deeper'
    return `You have the following question bank:\n\n${bankList}\n\nThe user wants a more thought-provoking, deeper question. Decide whether to pick one from the bank or generate a brand-new deeper question in a similar style. Return ONLY the question in plain text, with no quotes or extra commentary. Use proper grammar and punctuation.`;
  }
}

export async function POST(request) {
  try {
    // 4) We only need { type } from the request now.
    //    "currentQuestion" or "questionBank" are no longer needed,
    //    because GPT always sees your entire question bank anyway.
    const { type } = await request.json();

    // 5) Build system prompt from local question bank
    const systemPrompt = buildSystemPrompt(type);

    // 6) Make a single GPT call. GPT will pick or generate a question:
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
          content: "Please follow the system prompt carefully and return only the question.",
        },
      ],
    });

    // 7) Format GPT's response with your existing helper
    const rawGPTResponse = completion.choices[0]?.message?.content || '';
    const newQuestion = formatQuestion(rawGPTResponse);

    // 8) Return the new question to the client
    return NextResponse.json(
      { newQuestion },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Feedback Error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
