import { ImageResponse } from 'next/og';
import { db, publications, posts, users, eq, and } from '@solscribe/db';

export const runtime = 'edge';
export const alt = 'Article on Solscribe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { publicationSlug: string; postSlug: string };
}) {
  let post: any = null;
  let pub: any = null;
  let creator: any = null;

  try {
    pub = await db.query.publications.findFirst({
      where: (pubs, { eq }) => eq(pubs.slug, params.publicationSlug),
    });
    if (pub) {
      post = await db.query.posts.findFirst({
        where: (posts, { eq, and }) => and(eq(posts.publicationId, pub.id), eq(posts.slug, params.postSlug)),
      });
      creator = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, pub.ownerId),
      });
    }
  } catch {}

  const title = post?.title ?? 'Article';
  const pubName = pub?.name ?? 'Publication';
  const creatorName = creator?.displayName ?? creator?.username ?? 'Author';
  const isPaid = post?.isPaywalled ?? false;

  // Truncate title to 2 lines (~80 chars)
  const displayTitle = title.length > 80 ? title.substring(0, 80) + '...' : title;

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

        {/* SOLSCRIBE badge + PAID badge */}
        <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '60px', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', color: '#534AB7', textTransform: 'uppercase' }}>
            SOLSCRIBE
          </div>
          {isPaid && (
            <div style={{ display: 'flex', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
              PAID
            </div>
          )}
        </div>

        {/* Post title */}
        <div style={{ display: 'flex', fontSize: '48px', fontWeight: 800, color: '#e4e4e7', lineHeight: 1.2, marginBottom: '24px', maxWidth: '950px' }}>
          {displayTitle}
        </div>

        {/* Publication + creator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>
            {creatorName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', fontSize: '18px', color: '#a1a1aa' }}>
            {pubName}
          </div>
          <div style={{ display: 'flex', color: '#52525b', fontSize: '16px' }}>·</div>
          <div style={{ display: 'flex', fontSize: '16px', color: '#71717a' }}>
            by {creatorName}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
