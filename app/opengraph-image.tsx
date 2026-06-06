import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MyBillPort — Never Miss a Bill Again';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f1c2e 50%, #0d1f1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(77,106,159,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(107,203,119,0.08) 0%, transparent 60%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'rgba(77,106,159,0.3)',
              border: '2px solid rgba(77,106,159,0.5)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#7b9fd4',
            }}
          >
            M
          </div>
          <div style={{ fontSize: '42px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>
            MyBillPort
          </div>
          <div
            style={{
              background: 'rgba(107,203,119,0.15)',
              border: '1px solid rgba(107,203,119,0.3)',
              borderRadius: '999px',
              padding: '4px 14px',
              fontSize: '18px',
              color: '#6BCB77',
              fontWeight: '600',
            }}
          >
            🇨🇦 Made for Canada
          </div>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            letterSpacing: '-1.5px',
            maxWidth: '900px',
          }}
        >
          Never Miss a Bill Payment Again
        </div>

        <div
          style={{
            fontSize: '26px',
            color: 'rgba(148,163,184,0.9)',
            textAlign: 'center',
            maxWidth: '780px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          AI-powered bill management for Canadians. Track Rogers, Bell, Telus, Enbridge &amp; 120+ billers.
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {['Smart Reminders', 'AI Bill Scanning', 'Free to Start'].map(label => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '18px',
                color: 'rgba(203,213,225,0.9)',
                fontWeight: '600',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
