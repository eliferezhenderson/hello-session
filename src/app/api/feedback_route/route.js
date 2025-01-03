import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to format questions consistently
const formatQuestion = (question) => {
    return question
        .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
        .replace(/\s+/g, ' ')         // Normalize whitespace
        .trim()                       // Remove leading/trailing whitespace
        .replace(/^\w/, c => c.toUpperCase())  // Capitalize first letter
        .replace(/[.?!]+$/, '?');     // Ensure question ends with single question mark
};

export async function POST(request) {
    try {
        const { question, feedback } = await request.json();

        const systemPrompt = feedback === 'too_complex' 
            ? "You are a helpful assistant that generates simpler icebreaker questions. Generate a single question that is simpler than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text. Use proper grammar and capitalization."
            : "You are a helpful assistant that generates deeper icebreaker questions. Generate a single question that is more thought-provoking than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text. Use proper grammar and capitalization.";

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `The following question was considered ${feedback === 'too_complex' ? 'too complex' : 'too simple'}: "${question}". Please generate a ${feedback === 'too_complex' ? 'simpler' : 'deeper'} alternative.`
                }
            ],
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 100,
        });

        const newQuestion = formatQuestion(completion.choices[0].message.content);
        
        return new NextResponse(
            JSON.stringify({ newQuestion }), 
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

    } catch (error) {
        console.error('Feedback Error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to process feedback' }), 
            { status: 500 }
        );
    }
}