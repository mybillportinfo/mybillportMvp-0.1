export default function Dashboard() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E5E7EB',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 54,
          background: '#F8FAFC',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 40px 120px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* PHONE CHROME (bezel top) */}
        <div
          style={{
            height: 50,
            background: '#1C1C1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>9:41</div>
          
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 8,
              width: 126,
              height: 34,
              background: 'black',
              borderRadius: 17,
            }}
          />

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Signal */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
              <div style={{ width: 3, height: 4, background: 'white', borderRadius: 1 }} />
              <div style={{ width: 3, height: 6, background: 'white', borderRadius: 1 }} />
              <div style={{ width: 3, height: 9, background: 'white', borderRadius: 1 }} />
              <div style={{ width: 3, height: 12, background: 'white', borderRadius: 1 }} />
            </div>
            {/* Wifi */}
            <div style={{ color: 'white', fontSize: 12, marginTop: -2 }}>🛜</div>
            {/* Battery */}
            <div
              style={{
                width: 22,
                height: 12,
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 4,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: 1,
              }}
            >
              <div style={{ width: '80%', height: '100%', background: 'white', borderRadius: 2 }} />
              <div style={{ position: 'absolute', right: -3, width: 2, height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: '0 2px 2px 0' }} />
            </div>
          </div>
        </div>

        {/* SCROLL CONTENT */}
        <div
          style={{
            height: 'calc(844px - 50px - 82px)',
            overflowY: 'auto',
            paddingBottom: 24,
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* HEADER */}
          <div style={{ padding: '16px 20px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>👋 MyBillPort</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    🔔
                  </div>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#EF4444', borderRadius: 4, border: '2px solid #F8FAFC' }} />
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #5B5BE6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                  S
                </div>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 16 }}>Good morning, Sarah</div>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>You have 2 bills due this week</div>
          </div>

          {/* HERO CARD */}
          <div
            style={{
              margin: '16px 20px 0',
              padding: 20,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #5B5BE6 0%, #7C3AED 50%, #DB2777 100%)',
              boxShadow: '0 8px 32px rgba(91,91,230,0.4)',
            }}
          >
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total due this week</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>$487.48</div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(239,68,68,0.25)', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 20 }}>⚠ 1 Overdue</div>
              <div style={{ background: 'rgba(245,158,11,0.25)', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 20 }}>⏰ 2 Due Soon</div>
              <div style={{ background: 'rgba(16,185,129,0.25)', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 20 }}>✓ 5 Paid</div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ margin: '16px 20px 0', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, height: 72, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: '#5B5BE6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>＋</div>
              <div style={{ fontSize: 11, color: '#0F172A', marginTop: 6, fontWeight: 500 }}>Add Bill</div>
            </div>
            <div style={{ flex: 1, height: 72, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📷</div>
              <div style={{ fontSize: 11, color: '#0F172A', marginTop: 6, fontWeight: 500 }}>Scan Bill</div>
            </div>
            <div style={{ flex: 1, height: 72, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: '#7C3AED', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
              <div style={{ fontSize: 11, color: '#0F172A', marginTop: 6, fontWeight: 500 }}>AI Chat</div>
            </div>
            <div style={{ flex: 1, height: 72, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📊</div>
              <div style={{ fontSize: 11, color: '#0F172A', marginTop: 6, fontWeight: 500 }}>Insights</div>
            </div>
          </div>

          {/* SECTION LABEL */}
          <div style={{ margin: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Needs Attention</div>
            <div style={{ fontSize: 13, color: '#5B5BE6', fontWeight: 500 }}>See all</div>
          </div>

          {/* BILL CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 20px' }}>
            {/* Card A */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: '#FEF2F2', borderRadius: 23, color: '#EF4444', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Rogers Wireless</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Acct •••• 4821 · May 1</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>$89.99</div>
                <div style={{ background: '#FEF2F2', color: '#EF4444', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>OVERDUE</div>
              </div>
            </div>

            {/* Card B */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: '#FFFBEB', borderRadius: 23, color: '#F59E0B', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>H</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Hydro One</div>
                <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 500, marginTop: 2 }}>Account ••• 7291 · Today</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>$134.50</div>
                <div style={{ background: '#FFFBEB', color: '#F59E0B', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>TODAY</div>
              </div>
            </div>

            {/* Card C */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: '#EFF6FF', borderRadius: 23, color: '#3B82F6', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Bell Internet</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Account ••• 2847 · May 12</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>$79.99</div>
                <div style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>MAY 12</div>
              </div>
            </div>

            {/* Card D */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: '#FDF4FF', borderRadius: 23, color: '#9333EA', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>N</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Netflix Premium</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>May 15</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>$17.99</div>
                <div style={{ background: '#FDF4FF', color: '#9333EA', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>MAY 15</div>
              </div>
            </div>
          </div>

          {/* SECTION LABEL All Bills */}
          <div style={{ margin: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>All Bills</div>
            <div style={{ background: '#EEF2FF', color: '#5B5BE6', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>8</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 20px' }}>
            {/* Card E */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: '#F0FDF4', borderRadius: 23, color: '#10B981', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Enbridge Gas</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>May 20</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>$211.00</div>
                <div style={{ background: '#F0FDF4', color: '#10B981', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>MAY 20</div>
              </div>
            </div>
          </div>
          
        </div>

        {/* BOTTOM NAV */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: 82,
            background: 'white',
            borderTop: '1px solid #F1F5F9',
            paddingBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {/* Home Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ background: '#EEF2FF', padding: '4px 16px', borderRadius: 12, color: '#5B5BE6', fontSize: 16 }}>
              🏠
            </div>
            <div style={{ fontSize: 10, color: '#5B5BE6', fontWeight: 600 }}>Home</div>
          </div>
          
          {/* Bills Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.6 }}>
            <div style={{ padding: '4px 16px', fontSize: 16 }}>
              🧾
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Bills</div>
          </div>
          
          {/* Calendar Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.6 }}>
            <div style={{ padding: '4px 16px', fontSize: 16 }}>
              📅
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Calendar</div>
          </div>
          
          {/* Settings Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.6 }}>
            <div style={{ padding: '4px 16px', fontSize: 16 }}>
              ⚙️
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Settings</div>
          </div>
        </div>

      </div>
    </div>
  );
}
