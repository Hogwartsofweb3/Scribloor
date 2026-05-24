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
  Row,
  Column,
} from '@react-email/components';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app';
const PURPLE = '#534AB7';
const DARK_BG = '#09090b';
const CARD_BG = '#18181b';
const BORDER = '#27272a';
const MUTED = '#a1a1aa';
const BODY_TEXT = '#e4e4e7';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';

interface CreatorWelcomeProps {
  creatorName: string;
  publicationName: string;
  publicationSlug: string;
  publicationUrl: string;
  dashboardUrl?: string;
}

export function CreatorWelcome({
  creatorName,
  publicationName,
  publicationSlug,
  publicationUrl,
  dashboardUrl,
}: CreatorWelcomeProps) {
  const settingsUrl = dashboardUrl ?? `${APP_URL}/dashboard/settings`;
  const newPostUrl = `${APP_URL}/dashboard/posts/new`;

  const checklistItems = [
    {
      done: true,
      title: 'Create your publication',
      description: `"${publicationName}" is live and ready to receive subscribers.`,
      link: null,
      linkText: null,
    },
    {
      done: false,
      title: 'Write your first post',
      description: 'Publish a free welcome post to attract your first readers.',
      link: newPostUrl,
      linkText: 'New post →',
    },
    {
      done: false,
      title: 'Set your subscription price',
      description: 'Choose a monthly USDC price and configure your payout wallet.',
      link: settingsUrl,
      linkText: 'Edit settings →',
    },
    {
      done: false,
      title: 'Share your publication page',
      description: 'Your publication is publicly accessible — share it with your audience.',
      link: publicationUrl,
      linkText: `solscribe.app/${publicationSlug} →`,
    },
    {
      done: false,
      title: 'Promote your newsletter',
      description: 'Tweet about it, share in Discord, or add it to your bio links.',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just launched my Web3 newsletter "${publicationName}" on @Solscribe! Subscribe here: ${publicationUrl}`)}`,
      linkText: 'Share on Twitter →',
    },
  ];

  return (
    <Html lang="en">
      <Head />
      <Preview>
        🎉 {publicationName} is live! Here&apos;s your creator setup checklist.
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
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)',
                padding: '40px 40px 32px',
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <Text
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: PURPLE,
                  margin: '0 0 10px',
                }}
              >
                Solscribe · Creator Onboarding
              </Text>
              <Heading
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: BODY_TEXT,
                  lineHeight: '1.3',
                  margin: 0,
                }}
              >
                Welcome to the creator economy,{'\n'}
                <span style={{ color: AMBER }}>{creatorName}!</span>
              </Heading>
            </div>

            <Section style={{ padding: '40px' }}>
              <Text
                style={{ fontSize: '15px', color: MUTED, lineHeight: '1.7', margin: '0 0 32px' }}
              >
                Your publication{' '}
                <strong style={{ color: BODY_TEXT }}>&quot;{publicationName}&quot;</strong> is now
                live on Solscribe. You&apos;re one step closer to getting paid directly by your
                readers in USDC, on-chain. Here&apos;s your setup checklist to get started:
              </Text>

              {/* Checklist */}
              <div style={{ marginBottom: '32px' }}>
                {checklistItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#09090b',
                      border: `1px solid ${item.done ? EMERALD + '33' : BORDER}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      marginBottom: '10px',
                      display: 'flex',
                    }}
                  >
                    <Row>
                      <Column style={{ width: '28px', verticalAlign: 'top' }}>
                        <Text
                          style={{
                            fontSize: '16px',
                            margin: '2px 0 0',
                            lineHeight: 1,
                          }}
                        >
                          {item.done ? '✅' : '⬜'}
                        </Text>
                      </Column>
                      <Column>
                        <Text
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: item.done ? EMERALD : BODY_TEXT,
                            margin: '0 0 4px',
                          }}
                        >
                          {item.title}
                          {item.done && (
                            <span
                              style={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: EMERALD,
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                              }}
                            >
                              DONE
                            </span>
                          )}
                        </Text>
                        <Text
                          style={{ fontSize: '12px', color: MUTED, margin: '0', lineHeight: '1.5' }}
                        >
                          {item.description}
                          {item.link && (
                            <>
                              {' '}
                              <Link href={item.link} style={{ color: PURPLE }}>
                                {item.linkText}
                              </Link>
                            </>
                          )}
                        </Text>
                      </Column>
                    </Row>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
                <Button
                  href={`${APP_URL}/dashboard`}
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
                  Go to Creator Dashboard →
                </Button>
              </Section>

              <Hr style={{ borderColor: BORDER, margin: '0 0 24px' }} />

              <Text style={{ fontSize: '13px', color: '#52525b', lineHeight: '1.6', margin: 0 }}>
                💡 <strong style={{ color: MUTED }}>Pro tip:</strong> Creators who publish a free
                introductory post before setting a paid tier see 3× more initial subscribers.
                Consider writing a short welcome post to build your audience first.
              </Text>
            </Section>

            {/* Footer */}
            <div style={{ padding: '24px 40px', borderTop: `1px solid ${BORDER}` }}>
              <Text style={{ fontSize: '12px', color: '#52525b', lineHeight: '1.6', margin: 0 }}>
                You&apos;re receiving this because you created a publication on Solscribe. Questions?
                Reply to this email — we read every message.
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export default CreatorWelcome;
