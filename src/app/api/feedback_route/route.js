import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    try {
        const { question, feedback } = await request.json();

        if (feedback === 'too_complex') {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates simpler icebreaker questions. Generate a single question that is simpler than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text."
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
                { status: 200 }
            );
        } else if (feedback === 'too_simple') {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates deeper icebreaker questions. Generate a single question that is more thought-provoking than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text."
                    },
                    {
                        role: "user",
                        content: `The following question was considered too simple: "${question}". Please generate a deeper alternative.`
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            const newQuestion = completion.choices[0].message.content.trim();
            
            return new NextResponse(
                JSON.stringify({ newQuestion }), 
                { status: 200 }
            );
        }

        return new NextResponse(
            JSON.stringify({ error: 'Invalid feedback type' }), 
            { status: 400 }
        );

    } catch (error) {
        console.error('Feedback Error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to process feedback' }), 
            { status: 500 }
        );
    }
}