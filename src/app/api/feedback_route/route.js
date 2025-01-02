// src/app/api/feedback_route/route.js
export async function POST(request) {
    try {
      const { question, feedback } = await request.json();
  
      // Modified to handle both "simpler" and "deeper" requests
      const promptMap = {
        'too_simple': "Generate a single question that is deeper and more thought-provoking than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text.",
        'too_complex': "Generate a single question that is simpler and more approachable than the given question while maintaining the same theme or topic. The response should be just the question, without quotes or additional text."
      };
  
      if (feedback in promptMap) {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: promptMap[feedback]
            },
            {
              role: "user",
              content: `The following question was considered ${feedback === 'too_simple' ? 'not deep enough' : 'too complex'}: "${question}". Please generate an alternative.`
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
        JSON.stringify({ 
          success: true,
          message: 'Thank you for your feedback!'
        }), 
        { status: 200 }
      );
  
    } catch (error) {
      console.error('Feedback Error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to process feedback' }), 
        { status: 500 }
      );
    }
  }