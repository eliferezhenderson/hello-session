import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const questions = [
  "Where do you know from?",
  "One nice thing you did this weekend?",
  "A book title that influenced you?",
  "What are you listening to these days?",
  "What are you reading?",
  "What is one ritual you do while you travel",
  "One joyful thing you experienced this past week",
  "What do you do to destress",
  "What do you do when the weather is sunny",
  "What is the ideal wind-down routine for you",
  "What are you looking forward to",
  "Name one tip for time management",
  "What bop is playing in your earbuds right now",
  "What is a brave classroom",
  "What would you bring to a picnic",
  "What is your favorite karaoke song",
  "What is your favorite textile in honor of women's international day",
  "What motivates you?",
  "What do you do for rest and to recharge?",
  "How do you treat yourself after a hard days work",
  "What is the opening theme song to your biopic (movie of your life)?",
  "What is something you are thankful for?",
  "What book genre would your life be?",
  "Share something fun you did this last week",
  "What genre tv show would your life story be in",
  "What is a travel ritual? Ie, something you do before or during a trip?"
];

const redis = new Redis(process.env.REDIS_URL);

export async function GET() {
    try {
        const suggestions = await redis.lrange('suggestions', 0, -1);
        console.log('Raw suggestions from Redis:', suggestions);
        
        const parsedSuggestions = suggestions.map(s => {
            try {
                return JSON.parse(s).question;
            } catch (e) {
                console.log('Error parsing suggestion:', s);
                return null;
            }
        }).filter(Boolean);
        
        console.log('Parsed suggestions:', parsedSuggestions);
        
        const allQuestions = [...questions, ...parsedSuggestions];
        
        return new NextResponse(
            JSON.stringify({ 
                questions: allQuestions,
                rawSuggestions: suggestions,
                parsedSuggestions: parsedSuggestions
            }), 
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
            JSON.stringify({ 
                error: error.message,
                questions 
            }), 
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