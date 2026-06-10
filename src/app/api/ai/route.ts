import { NextResponse } from 'next/server';
import { parseFoodNaturalTextOffline, askCoachQuestion, analyzeFoodPhoto } from '../../../lib/aiEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (action === 'parse-food') {
      const { text } = body;
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
      }

      // If OpenAI key is present, we would normally perform structured extraction.
      // Here, we provide standard call logic, but fall back to the advanced offline parser.
      if (apiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              response_format: { type: 'json_object' },
              messages: [
                {
                  role: 'system',
                  content: 'You are a nutrition assistant. Parse the food text input into a structured JSON array under the key "foods". Each item must contain "name" (string), "servingSize" (string, e.g., "1 piece", "150g"), "calories" (number), "protein" (number, in grams), "carbs" (number, in grams), and "fat" (number, in grams). Estimate values reasonably if not exact.'
                },
                {
                  role: 'user',
                  content: text
                }
              ]
            })
          });

          const data = await response.json();
          if (data.choices && data.choices[0]?.message?.content) {
            const parsed = JSON.parse(data.choices[0].message.content);
            if (Array.isArray(parsed.foods)) {
              return NextResponse.json({ foods: parsed.foods });
            }
          }
        } catch (err) {
          console.error('OpenAI parse-food error, falling back to local engine:', err);
        }
      }

      // Offline rule-based parsing fallback
      const parsedFoods = parseFoodNaturalTextOffline(text);
      return NextResponse.json({ foods: parsedFoods });
    }

    if (action === 'analyze-photo') {
      const { image } = body; // base64 string or file path
      if (!image) {
        return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
      }

      if (apiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              response_format: { type: 'json_object' },
              messages: [
                {
                  role: 'system',
                  content: 'You are a nutritional vision scanner. Analyze the base64 food image and return a JSON object with a "detectedFoods" array containing: "name" (string), "serving" (string), "calories" (number), "protein" (number), "carbs" (number), "fat" (number). Also include a "summary" object containing totals of "calories", "protein", "carbs", and "fat".'
                },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Analyze this meal image:' },
                    { type: 'image_url', image_url: { url: image } }
                  ]
                }
              ]
            })
          });

          const data = await response.json();
          if (data.choices && data.choices[0]?.message?.content) {
            const parsed = JSON.parse(data.choices[0].message.content);
            return NextResponse.json({
              detectedFoods: parsed.detectedFoods || [],
              summary: parsed.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 }
            });
          }
        } catch (err) {
          console.error('OpenAI analyze-photo error, falling back to local engine:', err);
        }
      }

      // Offline mockup fallback
      const result = await analyzeFoodPhoto(image);
      return NextResponse.json(result);
    }

    if (action === 'ask-coach') {
      const { messages, question } = body;
      if (!question) {
        return NextResponse.json({ error: 'Question is required' }, { status: 400 });
      }

      if (apiKey) {
        try {
          const chatHistory = (messages || []).map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }));

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional nutrition and athletic training coach. Give precise, highly actionable advice. Keep answers structured, positive, and focused on helping the user achieve their calorie and fitness targets.'
                },
                ...chatHistory,
                { role: 'user', content: question }
              ]
            })
          });

          const data = await response.json();
          if (data.choices && data.choices[0]?.message?.content) {
            return NextResponse.json({ answer: data.choices[0].message.content });
          }
        } catch (err) {
          console.error('OpenAI ask-coach error, falling back to local engine:', err);
        }
      }

      // Offline rules fallback
      const answer = await askCoachQuestion(messages || [], question);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
