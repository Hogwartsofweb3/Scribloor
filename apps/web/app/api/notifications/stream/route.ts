import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getServerUser(req);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Set up SSE headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (event: string, data: any) => {
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  // We need to subscribe to Redis for real-time events.
  // Because Upstash Redis REST API doesn't support long-lived Pub/Sub connections directly 
  // without a proper Redis client (ioredis/redis), we can simulate pub/sub using a simple 
  // polling approach OR if we had a TCP connection we could use subscribe.
  // Since we are using @upstash/redis (REST), true pub/sub is not supported via REST.
  // Workaround: We'll poll a specific key for the user every 2 seconds.
  
  const userEventKey = `events:user:${user.id}`;
  let isConnectionAlive = true;

  req.signal.addEventListener('abort', () => {
    isConnectionAlive = false;
    writer.close();
  });

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    if (isConnectionAlive) {
      sendEvent('ping', { time: Date.now() });
    }
  }, 30000);

  // Poll for new events (workaround for Upstash REST lack of true pub/sub)
  const pollEvents = async () => {
    while (isConnectionAlive) {
      try {
        const events = await redis.lpop<any>(userEventKey, 10);
        if (events && events.length > 0) {
          events.forEach((evt: { type?: string; payload: unknown }) => {
            sendEvent(evt.type || 'message', evt.payload);
          });
        }
      } catch (err) {
        console.error('[SSE] Error polling events:', err);
      }
      // Wait 2 seconds
      await new Promise(r => setTimeout(r, 2000));
    }
    clearInterval(heartbeat);
  };

  pollEvents();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
