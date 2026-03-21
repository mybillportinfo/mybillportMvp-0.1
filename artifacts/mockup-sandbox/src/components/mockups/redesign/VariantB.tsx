export default function VariantB() {
  const colors = {
    bg: '#F7F9FC',
    primary: '#3451B2',
    accent: '#4ADE80',
    alertRed: '#EF4444',
    amber: '#F59E0B',
    cardBg: '#FFFFFF',
    textDark: '#0F172A',
    textMuted: '#64748B',
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* iPhone 14 Pro Frame */}
      <div
        style={{
          width: '390px',
          height: '844px',
          backgroundColor: colors.bg,
          borderRadius: '40px',
          border: '14px solid #1C1C1E',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160px',
            height: '32px',
            backgroundColor: '#1C1C1E',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            zIndex: 100,
          }}
        />

        {/* Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textDark,
            zIndex: 90,
            position: 'relative',
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Cellular */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill={colors.textDark}>
              <path d="M1 11h2V8H1v3zm4 0h2V6H5v5zm4 0h2V4H9v7zm4 0h2V1h-2v10z" />
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill={colors.textDark}>
              <path d="M8 12l8-10C15.5 1.5 12 0 8 0S.5 1.5 0 2l8 10z" />
            </svg>
            {/* Battery */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill={colors.textDark}>
              <rect x="1" y="2" width="20" height="8" rx="2" stroke={colors.textDark} strokeWidth="1" fill="none" />
              <rect x="3" y="4" width="16" height="4" rx="1" fill={colors.textDark} />
              <path d="M22 5h1v2h-1V5z" fill={colors.textDark} />
            </svg>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div
          style={{
            height: 'calc(100% - 130px)', // Adjust for status bar and bottom nav
            overflowY: 'auto',
            paddingBottom: '20px',
            paddingTop: '10px',
            scrollbarWidth: 'none',
          }}
        >
          {/* HEADER */}
          <div style={{ padding: '0 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ color: colors.primary, fontSize: '20px', fontWeight: 'bold' }}>
                MyBillPort
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Bell Icon */}
                <div style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {/* Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: colors.alertRed,
                      color: '#FFF',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '14px',
                      height: '14px',
                      borderRadius: '7px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    1
                  </div>
                </div>
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${colors.primary}, #7C3AED)`,
                    color: '#FFF',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  S
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textDark, marginBottom: '4px' }}>
                Good morning, Sarah
              </div>
              <div style={{ fontSize: '14px', color: colors.alertRed, fontWeight: '500' }}>
                3 bills need your attention
              </div>
            </div>
          </div>

          {/* PROGRESS TRACKER CARD */}
          <div
            style={{
              margin: '0 16px 24px',
              backgroundColor: colors.cardBg,
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>
              Monthly Progress
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textDark, marginBottom: '16px' }}>
              3 of 8 bills paid
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{ width: '37.5%', height: '100%', backgroundColor: colors.primary, borderRadius: '4px' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: colors.textMuted }}>$214.48 paid</span>
              <span style={{ color: colors.textDark, fontWeight: '600' }}>$487.48 remaining</span>
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{ display: 'flex', gap: '12px', margin: '0 16px 24px' }}>
            {/* Card A */}
            <div style={{ flex: 1, backgroundColor: colors.cardBg, borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>Overdue</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.alertRed, marginBottom: '4px' }}>1</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Rogers</div>
            </div>
            {/* Card B */}
            <div style={{ flex: 1, backgroundColor: colors.cardBg, borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>Due Today</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.amber, marginBottom: '4px' }}>1</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Hydro</div>
            </div>
            {/* Card C */}
            <div style={{ flex: 1, backgroundColor: colors.cardBg, borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>This Month</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, marginBottom: '4px' }}>5</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>bills</div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '0 16px 32px' }}>
            <div style={{ backgroundColor: colors.primary, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
                ＋
              </div>
              <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>Add Bill</span>
            </div>
            
            <div style={{ backgroundColor: '#10B981', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', fontSize: '16px' }}>
                📷
              </div>
              <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>AI Scan</span>
            </div>
            
            <div style={{ backgroundColor: '#7C3AED', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', fontSize: '16px' }}>
                📊
              </div>
              <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>Insights</span>
            </div>
            
            <div style={{ backgroundColor: colors.amber, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', fontSize: '16px' }}>
                📅
              </div>
              <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>Calendar</span>
            </div>
          </div>

          {/* BILL LIST */}
          <div style={{ margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textDark }}>
                All Bills
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary }}>
                Filter
              </div>
            </div>

            <div style={{ backgroundColor: colors.cardBg, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #F1F5F9', minHeight: '56px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors.alertRed, marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>Rogers Wireless</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: colors.alertRed, backgroundColor: '#FEF2F2', padding: '4px 8px', borderRadius: '4px' }}>OVERDUE</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>$89.99</div>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #F1F5F9', minHeight: '56px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors.amber, marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>Hydro One</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: colors.amber, backgroundColor: '#FFFBEB', padding: '4px 8px', borderRadius: '4px' }}>TODAY</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>$134.50</div>
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', minHeight: '56px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors.primary, marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>Bell Internet</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>May 12</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark }}>$79.99</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ height: '30px' }} />
        </div>

        {/* BOTTOM NAV */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '84px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: '20px',
            zIndex: 100,
          }}
        >
          {/* Home - Active */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.primary }}>Home</span>
          </div>

          {/* Bills */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: '500', color: colors.textMuted }}>Bills</span>
          </div>

          {/* Calendar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: '500', color: colors.textMuted }}>Calendar</span>
          </div>

          {/* Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: '500', color: colors.textMuted }}>Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
