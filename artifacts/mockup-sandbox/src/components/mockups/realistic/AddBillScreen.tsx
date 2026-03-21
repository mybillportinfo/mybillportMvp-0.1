export default function AddBillScreen() {
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
      {/* iPhone 14 Pro Frame */}
      <div
        style={{
          width: '390px',
          height: '844px',
          backgroundColor: '#F8FAFC',
          borderRadius: '54px',
          boxShadow:
            '0 0 0 12px #1C1C1E, inset 0 0 0 4px #000000, 0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Dynamic Island Area */}
        <div
          style={{
            height: '50px',
            width: '100%',
            position: 'absolute',
            top: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '12px',
          }}
        >
          {/* Dynamic Island Pill */}
          <div
            style={{
              width: '126px',
              height: '37px',
              backgroundColor: '#000000',
              borderRadius: '20px',
            }}
          />
        </div>

        {/* Top Status Bar Content (Time, Battery, Signal) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '16px 24px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#0F172A',
            zIndex: 10,
            position: 'relative',
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Signal Bars */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <path d="M1 12H3.5C3.77614 12 4 11.7761 4 11.5V8.5C4 8.22386 3.77614 8 3.5 8H1C0.723858 8 0.5 8.22386 0.5 8.5V11.5C0.5 11.7761 0.723858 12 1 12Z" />
              <path d="M5.5 12H8C8.27614 12 8.5 11.7761 8.5 11.5V6C8.5 5.72386 8.27614 5.5 8 5.5H5.5C5.22386 5.5 5 5.72386 5 6V11.5C5 11.7761 5.22386 12 5.5 12Z" />
              <path d="M10 12H12.5C12.7761 12 13 11.7761 13 11.5V3.5C13 3.22386 12.7761 3 12.5 3H10C9.72386 3 9.5 3.22386 9.5 3.5V11.5C9.5 11.7761 9.72386 12 10 12Z" />
              <path d="M14.5 12H17C17.2761 12 17.5 11.7761 17.5 11.5V0.5C17.5 0.223858 17.2761 0 17 0H14.5C14.2239 0 14 0.223858 14 0.5V11.5C14 11.7761 14.2239 12 14.5 12Z" />
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 12C8.68065 12 9.24545 11.4583 9.24545 10.7857C9.24545 10.1131 8.68065 9.57143 8 9.57143C7.31935 9.57143 6.75455 10.1131 6.75455 10.7857C6.75455 11.4583 7.31935 12 8 12Z" />
              <path d="M11.667 8.16335C11.1963 8.61466 10.4566 8.59013 10.0163 8.11306C9.57601 7.636 9.59966 6.88647 10.0704 6.43516C10.7183 5.81432 11.5647 5.42857 12.5 5.42857C13.4353 5.42857 14.2817 5.81432 14.9296 6.43516C15.4003 6.88647 15.424 7.636 14.9837 8.11306C14.5434 8.59013 13.8037 8.61466 13.333 8.16335C13.1118 7.95147 12.8166 7.82143 12.5 7.82143C12.1834 7.82143 11.8882 7.95147 11.667 8.16335Z" />
              <path d="M15.3409 4.63004C14.5768 3.89765 13.5936 3.42857 12.5 3.42857C11.4064 3.42857 10.4232 3.89765 9.65911 4.63004C9.18844 5.08135 8.44876 5.05682 8.00844 4.57976C7.56812 4.10269 7.59178 3.35316 8.06245 2.90185C9.20819 1.80353 10.7824 1.14286 12.5 1.14286C14.2176 1.14286 15.7918 1.80353 16.9376 2.90185C17.4082 3.35316 17.4319 4.10269 16.9916 4.57976C16.5512 5.05682 15.8116 5.08135 15.3409 4.63004Z" />
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" />
              <rect x="2" y="2" width="18" height="8" rx="2" />
              <path d="M24 4V8C24.5523 8 25 7.55228 25 7V5C25 4.44772 24.5523 4 24 4Z" />
            </svg>
          </div>
        </div>

        {/* HEADER */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#F1F5F9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#0F172A',
            }}
          >
            ✕
          </div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A' }}>
            Add Bill
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#5B5BE6',
              opacity: 0.4,
            }}
          >
            Save
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '34px', // Safe area
            scrollbarWidth: 'none',
          }}
        >
          {/* SCAN PROMO CARD */}
          <div
            style={{
              margin: '16px 20px 0',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #EEF2FF, #F5F0FF)',
              border: '1px solid rgba(91,91,230,0.12)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#5B5BE6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                flexShrink: 0,
              }}
            >
              📷
            </div>
            <div style={{ marginLeft: '12px', flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                Scan your bill
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                AI fills in all details automatically
              </div>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#5B5BE6',
                fontWeight: '600',
                marginLeft: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              Try it →
            </div>
          </div>

          {/* DIVIDER */}
          <div
            style={{
              margin: '16px 0',
              textAlign: 'center',
              fontSize: '12px',
              color: '#94A3B8',
            }}
          >
            — or fill in manually —
          </div>

          {/* FORM FIELDS */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Field 1 — Biller Name */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', marginBottom: '6px' }}>
                Biller / Company
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '13px 14px',
                  fontSize: '15px',
                  color: '#CBD5E1',
                }}
              >
                e.g. Rogers Wireless
              </div>
            </div>

            {/* Field 2 — Amount */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', marginBottom: '6px' }}>
                Amount Owing
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    padding: '13px 14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#94A3B8',
                  }}
                >
                  $
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '24px',
                    backgroundColor: '#E2E8F0',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    padding: '13px 14px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#CBD5E1',
                  }}
                >
                  0.00
                </div>
              </div>
            </div>

            {/* Field 3 — Due Date */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', marginBottom: '6px' }}>
                Due Date
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '13px 14px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    color: '#94A3B8',
                    marginRight: '12px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div style={{ flex: 1, fontSize: '15px', color: '#CBD5E1' }}>
                  Select date
                </div>
                <div style={{ color: '#94A3B8' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Field 4 — Category */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', marginBottom: '6px' }}>
                Category
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                }}
              >
                <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', backgroundColor: '#5B5BE6', color: 'white', whiteSpace: 'nowrap' }}>
                  📱 Telecom
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', backgroundColor: '#F1F5F9', color: '#64748B', whiteSpace: 'nowrap' }}>
                  ⚡ Utilities
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', backgroundColor: '#F1F5F9', color: '#64748B', whiteSpace: 'nowrap' }}>
                  🎬 Entertainment
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', backgroundColor: '#F1F5F9', color: '#64748B', whiteSpace: 'nowrap' }}>
                  🏠 Insurance
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', backgroundColor: '#F1F5F9', color: '#64748B', whiteSpace: 'nowrap' }}>
                  ⛽ Other
                </div>
              </div>
            </div>

            {/* Field 5 — Account # */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', marginBottom: '6px' }}>
                Account Number <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '400' }}>(Optional)</span>
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '13px 14px',
                  fontSize: '15px',
                  color: '#CBD5E1',
                }}
              >
                e.g. 1234-5678
              </div>
            </div>

            {/* Field 6 — Recurring toggle */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                  Recurring Bill
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '26px',
                    backgroundColor: '#CBD5E1',
                    borderRadius: '13px',
                    padding: '2px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Automatically track monthly or yearly bills
              </div>
            </div>

          </div>

          {/* BOTTOM CTA */}
          <div style={{ margin: '32px 20px 34px' }}>
            <div
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#5B5BE6',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 4px 12px rgba(91,91,230,0.2)',
              }}
            >
              Save Bill
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#94A3B8',
                marginTop: '12px',
              }}
            >
              This bill will appear on your dashboard
            </div>
          </div>

        </div>

        {/* Home Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            backgroundColor: '#1C1C1E',
            borderRadius: '100px',
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}