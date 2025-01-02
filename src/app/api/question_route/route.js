// src/app/api/question_route/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Question bank (excluding ones with negative feedback)
const questions = [
  "Where do you know from?",
  "One nice thing you did this weekend?",
  "A book title that influenced you?",
  "What are you listening to these days?",
  "What are you reading?",
  "one ritual you do while you travel",
  "small group breakouts",
  "one joyful thing this past week",
  "what do you do to destress",
  "what do you do when you are stressed",
  "what is the ideal stress party for you",
  "what are you looking forward to",
  "name one tip for time management",
  "what bop is playing in your earbuds right now",
  "what is a brave classroom",
  "what would you bring to a picnic",
  "what is your favorite karaoke song",
  "what is your favorite textile in honor of women's international day",
  "what motivates you",
  "what do you do for rest",
  "how do you treat yourself after a hard days work",
  "Opening theme song to your biopic",
  "mid autumn festival - something you are thankful for",
  "what book genre would your life be",
  "share something fun you did this last week",
  "what genre tv show would your life story be in",
  "travel ritual"
];

// GET handler
export async function GET() {
  try {
    // Add CORS headers
    return new NextResponse(
      JSON.stringify({ questions }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('GET Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch questions' }), 
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request) {
  try {
    const { question } = await request.json();
    
    // Create path to suggestions file
    const filePath = path.join(process.cwd(), 'suggested_questions.txt');
    
    // Append new question to file with timestamp
    const timestamp = new Date().toISOString();
    await fs.appendFile(filePath, `${timestamp}: ${question}\n`);

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Question saved successfully' 
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to save question' }), 
      { status: 500 }
    );
  }
}