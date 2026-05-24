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

interface SubscriptionConfirmationProps {
  subscriberName: string;
  publicationName: string;
  creatorName: string;
  amountUsdc: number;
  expiresAt: Date;
  txSignature: string;
  publicationUrl: string;
}

export function SubscriptionConfirmation({
  subscriberName,
  publicationName,
  creatorName,
  amountUsdc,
  expiresAt,
  txSignature,
  publicationUrl,
}: SubscriptionConfirmationProps) {
  const expiryFormatted = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const confirmedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const truncatedTx = `${txSignature.substring(0, 8)}...${txSignature.substring(txSignature.length - 8)}`;
  const platformFee = (amountUsdc * 0.04).toFixed(2);
  const creatorPayout = (amountUsdc * 0.96).toFixed(2);

  const receiptRow = (label: string, value: string, highlight?: boolean) => (
    <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
      <Column style={{ padding: '10px 0' }}>
        <Text style={{ fontSize: '13px', color: MUTED, margin: 0 }}>{label}</Text>
      </Column>
      <Column style={{ padding: '10px 0', textAlign: 'right' }}>
        <Text
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: highlight ? AMBER : BODY_TEXT,
            margin: 0,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Subscription confirmed — you now have access to {publicationName}!
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
                Solscribe · Subscription Confirmed
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
                You&apos;re now subscribed to{'\n'}
                <span style={{ color: AMBER }}>{publicationName}</span>
              </Heading>
            </div>

            <Section style={{ padding: '40px' }}>
              <Text style={{ fontSize: '15px', color: MUTED, lineHeight: '1.7', margin: '0 0 32px' }}>
                Hi {subscriberName}, your USDC payment has been confirmed on the Solana blockchain.
                Full access to subscriber-only content from{' '}
                <strong style={{ color: BODY_TEXT }}>{creatorName}</strong> is now unlocked.
              </Text>

              {/* Transaction Receipt Box */}
              <div
                style={{
                  backgroundColor: '#09090b',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '32px',
                }}
              >
                <Text
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color: '#52525b',
                    margin: '0 0 16px',
                  }}
                >
                  Transaction Receipt
                </Text>
                {receiptRow('Publication', publicationName)}
                {receiptRow('Creator', creatorName)}
                {receiptRow('Date', confirmedAt)}
                {receiptRow('Creator receives', `$${creatorPayout} USDC`)}
                {receiptRow('Platform fee (4%)', `$${platformFee} USDC`)}
                <Row>
                  <Column style={{ padding: '12px 0 0' }}>
                    <Text style={{ fontSize: '14px', fontWeight: 700, color: BODY_TEXT, margin: 0 }}>
                      Total charged
                    </Text>
                  </Column>
                  <Column style={{ padding: '12px 0 0', textAlign: 'right' }}>
                    <Text
                      style={{ fontSize: '14px', fontWeight: 800, color: AMBER, margin: 0 }}
                    >
                      ${amountUsdc.toFixed(2)} USDC
                    </Text>
                  </Column>
                </Row>
                <Hr style={{ borderColor: BORDER, margin: '16px 0' }} />
                <Text style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>
                  TX Signature:{' '}
                  <Link
                    href={`https://solscan.io/tx/${txSignature}`}
                    style={{ color: PURPLE, fontFamily: 'monospace' }}
                  >
                    {truncatedTx}
                  </Link>
                </Text>
              </div>

              {/* CTA */}
              <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Button
                  href={publicationUrl}
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
                  Start Reading →
                </Button>
              </Section>

              {/* Renewal info */}
              <div
                style={{
                  backgroundColor: '#09090b',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                }}
              >
                <Text style={{ fontSize: '13px', color: MUTED, margin: 0, lineHeight: '1.6' }}>
                  🗓 Your subscription renews on{' '}
                  <strong style={{ color: BODY_TEXT }}>{expiryFormatted}</strong>. Renewals on
                  Solscribe are settled manually — you&apos;ll receive a reminder before your term
                  expires.{' '}
                  <Link href={`${APP_URL}/account/subscriptions`} style={{ color: PURPLE }}>
                    Manage subscription
                  </Link>
                </Text>
              </div>
            </Section>

            {/* Footer */}
            <div style={{ padding: '24px 40px', borderTop: `1px solid ${BORDER}` }}>
              <Text style={{ fontSize: '12px', color: '#52525b', lineHeight: '1.6', margin: 0 }}>
                This payment was settled on the Solana blockchain. Solscribe never stores your
                private keys. If you didn&apos;t make this purchase, please{' '}
                <Link href={`${APP_URL}/support`} style={{ color: '#52525b' }}>
                  contact support
                </Link>{' '}
                immediately.
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export default SubscriptionConfirmation;
