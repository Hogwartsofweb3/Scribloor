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
  Img,
} from '@react-email/components';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app';
const PURPLE = '#534AB7';
const DARK_BG = '#09090b';
const CARD_BG = '#18181b';
const BORDER = '#27272a';
const MUTED = '#a1a1aa';
const BODY_TEXT = '#e4e4e7';

const baseBody: React.CSSProperties = {
  backgroundColor: DARK_BG,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '48px 16px',
};

const card: React.CSSProperties = {
  backgroundColor: CARD_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: '16px',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)',
  padding: '40px 40px 32px',
  borderBottom: `1px solid ${BORDER}`,
};

const logoText: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: PURPLE,
  margin: '0 0 10px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 800,
  color: BODY_TEXT,
  lineHeight: '1.3',
  margin: 0,
};

const bodySection: React.CSSProperties = {
  padding: '40px',
};

const footerStyle: React.CSSProperties = {
  padding: '24px 40px',
  borderTop: `1px solid ${BORDER}`,
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#52525b',
  lineHeight: '1.6',
  margin: 0,
};

const stepCardStyle: React.CSSProperties = {
  backgroundColor: '#09090b',
  border: `1px solid ${BORDER}`,
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: PURPLE,
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
};

export function WelcomeEmail({ username }: { username: string }) {
  const steps = [
    {
      num: '01',
      title: 'Explore Publications',
      body: 'Browse hundreds of creator newsletters across tech, finance, crypto, and culture. Find voices that speak to you.',
    },
    {
      num: '02',
      title: 'Subscribe with USDC',
      body: 'Pay securely on-chain using any Solana wallet. Your payment goes directly to the creator — no middlemen.',
    },
    {
      num: '03',
      title: 'Read Premium Content',
      body: 'Unlock subscriber-only posts and receive newsletters directly in your inbox the moment they\'re published.',
    },
  ];

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to Solscribe, {username}! Here's how to get started.</Preview>
      <Body style={baseBody}>
        <Container style={container}>
          <div style={card}>
            {/* Header */}
            <div style={headerStyle}>
              <p style={logoText}>Solscribe</p>
              <Heading style={headingStyle}>
                Welcome aboard,{'\n'}
                <span style={{ color: PURPLE }}>{username}!</span>
              </Heading>
            </div>

            {/* Body */}
            <Section style={bodySection}>
              <Text style={{ color: MUTED, fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
                You've joined the creator economy powered by Solana. Here's everything you need to
                know to get started on Solscribe.
              </Text>

              {steps.map((step) => (
                <div key={step.num} style={stepCardStyle}>
                  <Row>
                    <Column style={{ width: '40px', verticalAlign: 'top' }}>
                      <Text
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: PURPLE,
                          margin: 0,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {step.num}
                      </Text>
                    </Column>
                    <Column>
                      <Text style={{ fontSize: '14px', fontWeight: 700, color: BODY_TEXT, margin: '0 0 4px' }}>
                        {step.title}
                      </Text>
                      <Text style={{ fontSize: '13px', color: MUTED, margin: 0, lineHeight: '1.6' }}>
                        {step.body}
                      </Text>
                    </Column>
                  </Row>
                </div>
              ))}

              <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button href={`${APP_URL}/explore`} style={ctaButton}>
                  Explore Publications →
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <div style={footerStyle}>
              <Text style={footerText}>
                You're receiving this because you created an account on Solscribe. If this wasn't
                you, you can safely ignore this email.{' '}
                <Link href={`${APP_URL}/account`} style={{ color: '#52525b' }}>
                  Manage email preferences
                </Link>
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
