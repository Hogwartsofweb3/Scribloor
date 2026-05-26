import { ImageResponse } from 'next/og';
import { db, publications, users, eq } from '@solscribe/db';

export const runtime = 'edge';
export const alt = 'Publication on Solscribe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { publicationSlug: string } }) {
  let pub: any = null;
  let creator: any = null;

  try {
    pub = await db.query.publications.findFirst({
      where: (pubs, { eq }) => eq(pubs.slug, params.publicationSlug),
    });
    if (pub) {
      creator = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, pub.ownerId),
      });
    }
  } catch {}

  const pubName = pub?.name ?? 'Publication';
  const pubDesc = pub?.description ?? 'A newsletter on Solscribe';
  const creatorName = creator?.displayName ?? creator?.username ?? 'Creator';
  const subscriberCount = pub?.subscriberCount ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #09090b 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #534AB7 0%, #7c3aed 100%)' }} />

        {/* SOLSCRIBE badge */}
        <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '60px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', color: '#534AB7', textTransform: 'uppercase' }}>
          SOLSCRIBE
        </div>

        {/* Publication name */}
        <div style={{ display: 'flex', fontSize: '52px', fontWeight: 800, color: '#e4e4e7', lineHeight: 1.2, marginBottom: '16px', maxWidth: '900px' }}>
          {pubName}
        </div>

        {/* Description */}
        <div style={{ display: 'flex', fontSize: '22px', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '32px', maxWidth: '800px' }}>
          {pubDesc.length > 120 ? pubDesc.substring(0, 120) + '...' : pubDesc}
        </div>

        {/* Creator + subscriber count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 700 }}>
              {creatorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', fontSize: '18px', color: '#e4e4e7', fontWeight: 600 }}>
              {creatorName}
            </div>
          </div>
          <div style={{ display: 'flex', color: '#52525b', fontSize: '16px' }}>·</div>
          <div style={{ display: 'flex', fontSize: '16px', color: '#a1a1aa' }}>
            {subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''} on Solscribe
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
