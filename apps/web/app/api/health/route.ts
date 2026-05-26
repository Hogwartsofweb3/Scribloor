import { NextResponse } from 'next/server';
import { db } from '@solscribe/db';
import { sql } from '@solscribe/db';
import { redis } from '@/lib/redis';
import { getConnection } from '@/lib/solana/connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  
  let dbStatus = 'down';
  let redisStatus = 'down';
  let solanaStatus = 'down';
  
  // 1. Check DB
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbStatus = `ok (${Date.now() - dbStart}ms)`;
  } catch (err) {
    console.error('DB Healthcheck failed:', err);
  }

  // 2. Check Redis
  try {
    const redisStart = Date.now();
    await redis.set('healthcheck', 'ok', { ex: 5 });
    const val = await redis.get('healthcheck');
    if (val === 'ok') {
      redisStatus = `ok (${Date.now() - redisStart}ms)`;
    }
  } catch (err) {
    console.error('Redis Healthcheck failed:', err);
  }

  // 3. Check Solana RPC
  try {
    const solanaStart = Date.now();
    const rpcUrl = getConnection().rpcEndpoint;
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'healthcheck',
        method: 'getHealth'
      })
    });
    
    if (res.ok) {
      solanaStatus = `ok (${Date.now() - solanaStart}ms)`;
    }
  } catch (err) {
    console.error('Solana RPC Healthcheck failed:', err);
  }

  const duration = Date.now() - start;
  
  const isHealthy = dbStatus.startsWith('ok') && redisStatus.startsWith('ok') && solanaStatus.startsWith('ok');
  
  return NextResponse.json({
    status: isHealthy ? 'ok' : 'degraded',
    services: {
      db: dbStatus,
      redis: redisStatus,
      solana: solanaStatus,
    },
    latency: {
      totalMs: duration
    }
  }, {
    status: isHealthy ? 200 : 503
  });
}
