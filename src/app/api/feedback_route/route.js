import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1) Import your single source of truth for the question bank:
import questions from '../../questions.js'; 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2) Helper function to format questions consistently
function formatQuestion(question) {
  return question
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim()                     // Remove leading/trailing whitespace
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .replace(/[.?!]+$/, '?');   // Ensure question ends with a single '?'
}

// 3) Build a System Prompt that includes your entire question bank
function buildSystemPrompt(type, excludedQuestions = []) {
  // Convert your array of questions to a bullet-list or joined string
  const bankList = questions
    .map((q, i) => `(${i + 1}) ${q}`)
    .join('\n');

  // We'll define the base instructions for GPT
  let baseInstructions = '';
  if (type === 'random') {
    baseInstructions = `The user wants a random icebreaker question. Decide whether to pick one from the bank or generate a brand-new question in a similar style.`;
  } else if (type === 'easier') {
    baseInstructions = `The user wants a simpler, easier icebreaker question. Decide whether to pick one from the bank or generate a brand-new simpler question in a similar style.`;
  } else {
    // 'deeper'
    baseInstructions = `The user wants a more thought-provoking, deeper question. Decide whether to pick one from the bank or generate a brand-new deeper question in a similar style.`;
  }

  // If we have questions to exclude, let GPT know:
  let exclusionText = '';
  if (excludedQuestions.length > 0) {
    // Exclusion text is just a line telling GPT to avoid these questions
    exclusionText = `\n\nDo NOT return any of the following questions (recently used):\n- ${excludedQuestions.join('\n- ')}`;
  }

  // Combine everything into the final system prompt
  const systemPrompt = `
You have the following question bank:
${bankList}

${baseInstructions}
Return ONLY the question in plain text, with no quotes or extra commentary.
Use proper grammar and punctuation.

${exclusionText}
  `.trim();

  return systemPrompt;
}

export async function POST(request) {
  try {
    // 4) We read { type, excludedQuestions } from the request now.
    const { type, excludedQuestions } = await request.json();

    // 5) Build system prompt from local question bank + excluded questions
    const systemPrompt = buildSystemPrompt(type, excludedQuestions || []);

    // 6) Make a single GPT call. GPT will pick or generate a question:
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
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

    // 7) Format GPT's response
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
