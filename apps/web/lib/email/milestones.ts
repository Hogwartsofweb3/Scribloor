import { Resend } from 'resend';
import MilestoneEmail from '@/emails/MilestoneEmail';
import { MilestoneType } from '../milestones/check';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendMilestoneEmail(userId: string, email: string, username: string, milestone: MilestoneType) {
  try {
    const formatMilestone = (m: string) => {
      switch(m) {
        case 'first_subscriber': return 'your First Subscriber';
        case 'subscribers_10': return '10 Subscribers';
        case 'subscribers_100': return '100 Subscribers';
        case 'subscribers_1k': return '1,000 Subscribers';
        case 'first_usdc': return 'your First USDC';
        case 'usdc_100': return '100 USDC Earned';
        case 'usdc_1k': return '1,000 USDC Earned';
        case 'usdc_10k': return '10,000 USDC Earned';
        case 'first_vault_entry': return 'your First Vault Entry';
        case 'publishing_streak_7': return 'a 7-Week Publishing Streak';
        case 'publishing_streak_30': return 'a 30-Week Publishing Streak';
        default: return m;
      }
    };

    const formattedMilestone = formatMilestone(milestone);

    await resend.emails.send({
      from: 'Solscribe <hello@solscribe.app>',
      to: [email],
      subject: `You just hit ${formattedMilestone} on Solscribe 🎯`,
      react: MilestoneEmail({ username, milestone: formattedMilestone }),
    });

    console.log(`[Email] Milestone email sent to ${email} for ${milestone}`);
  } catch (error) {
    console.error(`[Email] Failed to send milestone email to ${email}:`, error);
  }
}
