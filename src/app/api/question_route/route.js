import questions from '../../questions.js';

export async function GET() {
  return new Response(JSON.stringify({ questions }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid question' }), { status: 400 });
    }

    console.log('Suggested question:', question);

    return new Response(JSON.stringify({ message: 'Received!' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('POST /question_route failed:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
