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

interface RenewalReminderProps {
  subscriberName: string;
  publicationName: string;
  expiresAt: Date;
  renewUrl: string;
  amountUsdc: number;
}

export function RenewalReminder({
  subscriberName,
  publicationName,
  expiresAt,
  renewUrl,
  amountUsdc,
}: RenewalReminderProps) {
  const expiryFormatted = expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const msRemaining = expiresAt.getTime() - Date.now();
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const dayLabel = daysRemaining === 1 ? '1 day' : `${daysRemaining} days`;
  const previewText = `⏳ Your ${publicationName} subscription expires in ${dayLabel} — renew now to keep access.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
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
            {/* Urgency banner */}
            <div
              style={{
                backgroundColor: '#431407',
                borderBottom: `1px solid #7c2d12`,
                padding: '10px 40px',
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: AMBER,
                  margin: 0,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}
              >
                ⚠️ Action required — subscription expiring soon
              </Text>
            </div>

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
                Solscribe · Renewal Reminder
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
                Your subscription expires in{'\n'}
                <span style={{ color: AMBER }}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </span>
              </Heading>
            </div>

            <Section style={{ padding: '40px' }}>
              <Text
                style={{ fontSize: '15px', color: MUTED, lineHeight: '1.7', margin: '0 0 28px' }}
              >
                Hi {subscriberName}, your subscription to{' '}
                <strong style={{ color: BODY_TEXT }}>{publicationName}</strong> is set to expire on{' '}
                <strong style={{ color: AMBER }}>{expiryFormatted}</strong>. Renew now to maintain
                uninterrupted access to subscriber-only content.
              </Text>

              {/* Expiry details card */}
              <div
                style={{
                  backgroundColor: '#09090b',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '32px',
                }}
              >
                <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <Column style={{ padding: '10px 0' }}>
                    <Text style={{ fontSize: '13px', color: MUTED, margin: 0 }}>Publication</Text>
                  </Column>
                  <Column style={{ padding: '10px 0', textAlign: 'right' as const }}>
                    <Text style={{ fontSize: '13px', fontWeight: 600, color: BODY_TEXT, margin: 0 }}>
                      {publicationName}
                    </Text>
                  </Column>
                </Row>
                <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <Column style={{ padding: '10px 0' }}>
                    <Text style={{ fontSize: '13px', color: MUTED, margin: 0 }}>Expires</Text>
                  </Column>
                  <Column style={{ padding: '10px 0', textAlign: 'right' as const }}>
                    <Text style={{ fontSize: '13px', fontWeight: 600, color: AMBER, margin: 0 }}>
                      {expiryFormatted}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column style={{ padding: '12px 0 0' }}>
                    <Text style={{ fontSize: '14px', fontWeight: 700, color: BODY_TEXT, margin: 0 }}>
                      Renewal cost
                    </Text>
                  </Column>
                  <Column style={{ padding: '12px 0 0', textAlign: 'right' as const }}>
                    <Text
                      style={{ fontSize: '14px', fontWeight: 800, color: AMBER, margin: 0 }}
                    >
                      ${amountUsdc.toFixed(2)} USDC/month
                    </Text>
                  </Column>
                </Row>
              </div>

              {/* CTA */}
              <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
                <Button
                  href={renewUrl}
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
                  Renew for ${amountUsdc.toFixed(2)} USDC →
                </Button>
              </Section>

              <Text style={{ fontSize: '13px', color: '#52525b', textAlign: 'center' as const, margin: 0 }}>
                If you choose not to renew, your access will be removed when your current term ends.
                No automatic charges will be made.{' '}
                <Link href={`${APP_URL}/account/subscriptions`} style={{ color: PURPLE }}>
                  Manage subscription
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <div style={{ padding: '24px 40px', borderTop: `1px solid ${BORDER}` }}>
              <Text style={{ fontSize: '12px', color: '#52525b', lineHeight: '1.6', margin: 0 }}>
                You&apos;re receiving this reminder because you have an active subscription on
                Solscribe. Renewals are always opt-in — we will never charge you automatically.
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export default RenewalReminder;
