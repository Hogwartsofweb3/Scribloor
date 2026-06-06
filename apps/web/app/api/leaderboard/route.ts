import { NextResponse } from 'next/server';
import { getLeaderboardData } from '@/lib/api/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaderboardData = await getLeaderboardData();

    if (!leaderboardData) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('[API] Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
