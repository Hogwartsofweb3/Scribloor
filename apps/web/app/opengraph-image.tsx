import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Solscribe — Crypto-native newsletter platform on Solana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #09090b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Purple accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #534AB7 0%, #7c3aed 50%, #534AB7 100%)',
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: 'flex',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#534AB7',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          SOLSCRIBE
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '56px',
            fontWeight: 800,
            color: '#e4e4e7',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          Crypto-native newsletters,
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '56px',
            fontWeight: 800,
            color: '#f59e0b',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          powered by Solana
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            color: '#a1a1aa',
            marginTop: '32px',
            textAlign: 'center',
          }}
        >
          Subscribe with USDC · Paid directly to creators · On-chain
        </div>

        {/* Bottom border */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#52525b',
            fontSize: '16px',
          }}
        >
          solscribe.app
        </div>
      </div>
    ),
    { ...size }
  );
}
