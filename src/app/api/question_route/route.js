import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const questions = [
    // ... your existing questions array ...
];

const redis = new Redis(process.env.REDIS_URL);

export async function GET() {
    try {
        // Get suggestions from Redis
        const suggestions = await redis.lrange('suggestions', 0, -1);
        const parsedSuggestions = suggestions.map(s => JSON.parse(s).question);
        
        // Combine original questions with suggestions
        const allQuestions = [...questions, ...parsedSuggestions];
        
        return new NextResponse(
            JSON.stringify({ questions: allQuestions }), 
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('GET Error:', error);
        // If Redis fails, at least return the original questions
        return new NextResponse(
            JSON.stringify({ questions }), 
            { status: 200 }
        );
    }
}

export async function POST(request) {
    try {
        const { question } = await request.json();
        
        const suggestion = {
            timestamp: new Date().toISOString(),
            question: question
        };

        await redis.lpush('suggestions', JSON.stringify(suggestion));

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