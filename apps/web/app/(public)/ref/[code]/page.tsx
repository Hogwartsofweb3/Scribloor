import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, referrals, users, eq } from '@solscribe/db';

export default async function ReferralHandlerPage({ params, searchParams }: { params: { code: string }, searchParams: { redirect_to?: string } }) {
  const { code } = params;
  
  if (code) {
    // 1. Verify the code exists
    const referrer = await db.query.users.findFirst({
      where: eq(users.id, code) // Currently using user ID as the simplest referral code
    });

    if (referrer) {
      // 2. Set cookie for 30 days
      cookies().set('solscribe_ref', code, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
  }

  // 3. Redirect to destination or home
  const destination = searchParams.redirect_to || '/';
  
  // Basic sanity check to prevent open redirects (only allow relative paths)
  if (destination.startsWith('/')) {
    redirect(destination);
  } else {
    redirect('/');
  }
}
