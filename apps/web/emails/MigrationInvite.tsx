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
  Link,
  Preview,
  Hr,
} from '@react-email/components';

interface MigrationInviteProps {
  creatorName: string;
  publicationName: string;
  readerName: string;
  inviteUrl: string;
  monthlyPriceUsdc: number;
  publicationDescription: string;
}

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
  fontSize: '22px',
  fontWeight: 800,
  color: BODY_TEXT,
  lineHeight: '1.4',
  margin: 0,
};

const bodySection: React.CSSProperties = {
  padding: '40px',
};

const ctaButtonContainer: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '24px',
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

const blockSection: React.CSSProperties = {
  backgroundColor: '#09090b',
  border: `1px solid ${BORDER}`,
  borderRadius: '12px',
  padding: '20px',
  marginTop: '24px',
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

export const MigrationInvite = ({
  creatorName,
  publicationName,
  readerName,
  inviteUrl,
  monthlyPriceUsdc,
  publicationDescription,
}: MigrationInviteProps) => {
  const priceDisplay = monthlyPriceUsdc > 0 ? `${monthlyPriceUsdc} USDC` : 'Free';

  return (
    <Html lang="en">
      <Head />
      <Preview>{creatorName} has moved to Solscribe — continue your subscription here.</Preview>
      <Body style={baseBody}>
        <Container style={container}>
          <div style={card}>
            {/* Header */}
            <div style={headerStyle}>
              <p style={logoText}>{publicationName}</p>
              <Heading style={headingStyle}>
                Reactivate your subscription from <span style={{ color: PURPLE }}>{creatorName}</span>
              </Heading>
            </div>

            {/* Body */}
            <Section style={bodySection}>
              <Text style={{ fontSize: '15px', color: BODY_TEXT, fontWeight: '600', margin: '0 0 16px' }}>
                Hi {readerName},
              </Text>
              
              <Text style={{ color: MUTED, fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>
                <strong>{creatorName}</strong> has moved their newsletter, <strong>{publicationName}</strong>, to Solscribe.
                Solscribe is a new web3 publishing platform that lets creators keep 96% of what they earn, powered directly by instant, gasless digital dollar payments.
              </Text>

              {publicationDescription && (
                <Text style={{ color: MUTED, fontSize: '13px', fontStyle: 'italic', borderLeft: `2px solid ${PURPLE}`, paddingLeft: '12px', margin: '16px 0' }}>
                  "{publicationDescription}"
                </Text>
              )}

              <Text style={{ color: MUTED, fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
                Your subscription continues here. Simply click the button below to reactivate it using your wallet. It takes less than 2 minutes.
              </Text>

              <Section style={ctaButtonContainer}>
                <Button href={inviteUrl} style={ctaButton}>
                  Reactivate my subscription — {priceDisplay}/month
                </Button>
              </Section>

              {/* What is USDC? info box */}
              <div style={blockSection}>
                <Text style={{ fontSize: '13px', fontWeight: 700, color: BODY_TEXT, margin: '0 0 8px' }}>
                  What is USDC?
                </Text>
                <Text style={{ fontSize: '12px', color: MUTED, margin: '0 0 12px', lineHeight: '1.5' }}>
                  USDC is a stablecoin pegged 1:1 to the US Dollar. It is a digital dollar that you can send anywhere in the world instantly, secure on the blockchain.
                </Text>
                <Text style={{ fontSize: '12px', color: MUTED, margin: 0, lineHeight: '1.5' }}>
                  Need USDC? You can purchase it instantly using local banking options or credit cards via{' '}
                  <Link href="https://yellowcard.io" style={{ color: PURPLE, textDecoration: 'underline' }}>
                    Yellow Card
                  </Link>{' '}
                  (for African readers) or{' '}
                  <Link href="https://transak.com" style={{ color: PURPLE, textDecoration: 'underline' }}>
                    Transak
                  </Link>{' '}
                  (for international readers).
                </Text>
              </div>

              <Hr style={{ borderColor: BORDER, margin: '32px 0 16px' }} />

              <Text style={{ fontSize: '11px', color: '#52525b', lineHeight: '1.5', margin: 0 }}>
                If you do not wish to continue your subscription, you can safely ignore this email. No action is required, and you will not be charged.
              </Text>
            </Section>

            {/* Footer */}
            <div style={footerStyle}>
              <Text style={footerText}>
                Sent on behalf of {publicationName} via Solscribe. Solscribe Inc., Solana Ecosystem.
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
};

export default MigrationInvite;
