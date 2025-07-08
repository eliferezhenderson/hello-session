import questions from '../../questions.js';
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

let isConnected = false;
async function connectRedis() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

export async function GET() {
  return new Response(JSON.stringify({ questions }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid question' }), { status: 400 });
    }

    await connectRedis();

    // Push to Redis list
    await redis.lPush('submitted_questions', question.trim());

    return new Response(JSON.stringify({ message: 'Saved to Redis Cloud!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Redis POST error:', error);
    return new Response(JSON.stringify({ error: 'Redis write failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
