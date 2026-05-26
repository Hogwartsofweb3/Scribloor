import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface MilestoneEmailProps {
  username: string;
  milestone: string;
}

export const MilestoneEmail = ({
  username = 'Creator',
  milestone = '100 Subscribers',
}: MilestoneEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You just hit a new milestone on Solscribe!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Congratulations, {username}! 🎉</Heading>
          
          <Text style={text}>
            You just hit an incredible milestone on your journey with Solscribe:
          </Text>

          <Section style={milestoneBadge}>
            <Text style={badgeText}>{milestone}</Text>
          </Section>

          <Text style={text}>
            We're building Solscribe so creators like you can own your audience and earn what you deserve. 
            Hitting this milestone is proof that your hard work is paying off.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href="https://solscribe.app/dashboard">
              View Your Dashboard
            </Button>
          </Section>
          
          <Text style={text}>
            Keep writing, keep publishing, and keep growing. We can't wait to see what you achieve next!
          </Text>

          <Text style={footer}>
            The Solscribe Team<br />
            Built on Solana. Powered by USDC.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MilestoneEmail;

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '600px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: '800',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '26px',
};

const milestoneBadge = {
  backgroundColor: '#eef2ff',
  border: '2px solid #4f46e5',
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const badgeText = {
  color: '#4f46e5',
  fontSize: '24px',
  fontWeight: '800',
  margin: 0,
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '48px',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
};
