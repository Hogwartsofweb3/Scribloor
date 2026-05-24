import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
  Preview,
  Img,
} from '@react-email/components';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app';
const PURPLE = '#534AB7';
const DARK_BG = '#09090b';
const CARD_BG = '#18181b';
const BORDER = '#27272a';
const MUTED = '#a1a1aa';
const BODY_TEXT = '#e4e4e7';
const AMBER = '#f59e0b';

interface NewPostNotificationProps {
  subscriberName: string;
  publicationName: string;
  postTitle: string;
  postSubtitle?: string | null;
  postPreviewHtml: string;
  postUrl: string;
  isPaywalled: boolean;
  coverImageUrl?: string | null;
  creatorName?: string;
  creatorAvatarUrl?: string | null;
}

export function NewPostNotification({
  subscriberName,
  publicationName,
  postTitle,
  postSubtitle,
  postPreviewHtml,
  postUrl,
  isPaywalled,
  coverImageUrl,
  creatorName,
  creatorAvatarUrl,
}: NewPostNotificationProps) {
  // Strip HTML tags to get ~200 word plain text preview
  const plainPreview = postPreviewHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 200)
    .join(' ');

  const ctaLabel = isPaywalled
    ? 'Read the full post (subscriber only) →'
    : 'Read the full post →';

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {publicationName}: {postTitle}
      </Preview>
      <Body
        style={{
          backgroundColor: DARK_BG,
          fontFamily: "'Inter', system-ui, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 16px' }}>
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Publication Header */}
            <div
              style={{
                padding: '28px 40px 24px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {creatorAvatarUrl && (
                <Img
                  src={creatorAvatarUrl}
                  alt={creatorName ?? publicationName}
                  width={40}
                  height={40}
                  style={{ borderRadius: '10px', objectFit: 'cover' }}
                />
              )}
              <div>
                <Text
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: PURPLE,
                    margin: 0,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  {publicationName}
                </Text>
                {creatorName && (
                  <Text style={{ fontSize: '12px', color: '#52525b', margin: '2px 0 0' }}>
                    by {creatorName}
                  </Text>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {coverImageUrl && (
              <Img
                src={coverImageUrl}
                alt={postTitle}
                width={600}
                style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }}
              />
            )}

            {/* Post Content */}
            <Section style={{ padding: coverImageUrl ? '32px 40px 40px' : '40px 40px' }}>
              <Text style={{ fontSize: '12px', color: '#52525b', margin: '0 0 12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                New Post
              </Text>
              <Heading
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: BODY_TEXT,
                  lineHeight: '1.3',
                  margin: '0 0 8px',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {postTitle}
              </Heading>

              {postSubtitle && (
                <Text
                  style={{
                    fontSize: '16px',
                    color: MUTED,
                    lineHeight: '1.6',
                    margin: '0 0 24px',
                    fontStyle: 'italic',
                  }}
                >
                  {postSubtitle}
                </Text>
              )}

              <Hr style={{ borderColor: BORDER, margin: '24px 0' }} />

              {/* Post preview text */}
              <Text
                style={{
                  fontSize: '15px',
                  color: MUTED,
                  lineHeight: '1.8',
                  margin: '0 0 32px',
                }}
              >
                {plainPreview}
                {isPaywalled ? '…' : ''}
              </Text>

              {/* Paywall notice */}
              {isPaywalled && (
                <div
                  style={{
                    backgroundColor: '#09090b',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '10px',
                    padding: '16px 20px',
                    marginBottom: '28px',
                    textAlign: 'center' as const,
                  }}
                >
                  <Text
                    style={{
                      fontSize: '13px',
                      color: AMBER,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    🔒 This post is exclusive to subscribers
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#52525b', margin: '4px 0 0' }}>
                    You&apos;re subscribed — click below for full access.
                  </Text>
                </div>
              )}

              {/* CTA */}
              <Section style={{ textAlign: 'center' as const }}>
                <Button
                  href={postUrl}
                  style={{
                    backgroundColor: PURPLE,
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  {ctaLabel}
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <div style={{ padding: '24px 40px', borderTop: `1px solid ${BORDER}` }}>
              <Text style={{ fontSize: '12px', color: '#52525b', lineHeight: '1.6', margin: 0 }}>
                You&apos;re receiving this because you subscribed to{' '}
                <strong>{publicationName}</strong> on Solscribe.{' '}
                <Link href={`${APP_URL}/account/subscriptions`} style={{ color: '#52525b' }}>
                  Manage subscriptions
                </Link>
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export default NewPostNotification;
