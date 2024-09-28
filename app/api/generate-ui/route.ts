// app/api/generate-ui/route.ts
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  const stream = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Generate a simple HTML UI based on this description: ${description}. 
        The UI should be a single HTML file with inline CSS and JavaScript. 
        Do not include any external resources. Make sure the UI is responsive and looks good on both desktop and mobile devices.
        Only return the HTML. Your response should start with <html>
`,
      },
    ],
    stream: true,
  });

  const streamResponse = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          controller.enqueue(chunk.delta.text);
        }
      }
      controller.close();
    },
  });

  return new Response(streamResponse, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
