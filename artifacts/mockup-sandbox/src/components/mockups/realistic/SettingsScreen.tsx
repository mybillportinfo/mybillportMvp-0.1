export default function SettingsScreen() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5E7EB', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      
      {/* iPhone 14 Pro Frame */}
      <div style={{ position: 'relative', width: '390px', height: '844px', backgroundColor: '#F8FAFC', borderRadius: '54px', overflow: 'hidden', boxShadow: '0 0 0 12px #1C1C1E, 0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Top Status Bar */}
        <div style={{ height: '47px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box', position: 'absolute', top: 0, zIndex: 50, color: '#0F172A' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.2px' }}>9:41</div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
              <path d="M1 8.5C1 8.5 2.5 7.5 4 7.5C5.5 7.5 7 8.5 7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M1.5 5.5C1.5 5.5 4.5 3.5 8.5 3.5C12.5 3.5 15.5 5.5 15.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2.5 2.5C2.5 2.5 6.5 0.5 11.5 0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path d="M1 10.5L1 5.5C1 3.5 2 2.5 4 2.5L12 2.5C14 2.5 15 3.5 15 5.5L15 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 2.5L5 1.5C5 0.5 5.5 0 6.5 0L9.5 0C10.5 0 11 0.5 11 1.5L11 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" />
              <rect x="2" y="2" width="14" height="8" rx="2" fill="currentColor" />
              <path d="M24 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Dynamic Island */}
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '126px', height: '37px', backgroundColor: '#000000', borderRadius: '20px', zIndex: 50 }}></div>

        {/* Scrollable Content */}
        <div style={{ width: '100%', height: '100%', overflowY: 'auto', paddingBottom: '100px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          
          {/* Header */}
          <div style={{ padding: '0 20px', paddingTop: '64px', paddingBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>Settings</h1>
          </div>

          {/* Profile Card */}
          <div style={{ margin: '8px 20px 4px', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #5B5BE6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '22px', fontWeight: 700, flexShrink: 0 }}>
              S
            </div>
            <div style={{ flex: 1, marginLeft: '14px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Sarah Mitchell</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>sarah@gmail.com</div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', marginRight: '4px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>Premium Plan ✓</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#5B5BE6', cursor: 'pointer' }}>
              Edit
            </div>
          </div>

          {/* Premium Upsell / Active */}
          <div style={{ margin: '8px 20px 0', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #5B5BE6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(91,91,230,0.2)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>✓ Premium Active</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Renews June 1, 2026 · $7.00/mo</div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>
              Manage →
            </div>
          </div>

          {/* Notifications Section */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', margin: '0 20px 8px' }}>NOTIFICATIONS</div>
            <div style={{ margin: '0 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              
              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#5B5BE6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Push Notifications</div>
                <div style={{ width: '44px', height: '24px', backgroundColor: '#5B5BE6', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '2px', boxSizing: 'border-box', justifyContent: 'flex-end', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                </div>
              </div>
              
              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>
              
              {/* Row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Bill Reminders</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginRight: '4px' }}>7, 3, 1 days before</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>

              {/* Row 3 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Email Alerts</div>
                <div style={{ width: '44px', height: '24px', backgroundColor: '#E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '2px', boxSizing: 'border-box', justifyContent: 'flex-start', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Security Section */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', margin: '0 20px 8px' }}>SECURITY</div>
            <div style={{ margin: '0 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              
              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#5B5BE6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-1.04-.158-2.043-.448-3M12 6a6 6 0 0 0-6 6c0 3.314 2.686 6 6 6s6-2.686 6-6M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Biometric Pay</div>
                <div style={{ width: '44px', height: '24px', backgroundColor: '#5B5BE6', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '2px', boxSizing: 'border-box', justifyContent: 'flex-end', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                </div>
              </div>
              
              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>
              
              {/* Row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Two-Factor Auth</div>
                <div style={{ fontSize: '12px', color: '#10B981', marginRight: '4px' }}>Enabled</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>

              {/* Row 3 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Change Password</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

            </div>
          </div>

          {/* App Section */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', margin: '0 20px 8px' }}>APP</div>
            <div style={{ margin: '0 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              
              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Country / Region</div>
                <div style={{ fontSize: '14px', color: '#64748B', marginRight: '4px' }}>🇨🇦 Canada</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              
              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>
              
              {/* Row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Appearance</div>
                <div style={{ fontSize: '14px', color: '#64748B', marginRight: '4px' }}>System</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

              <div style={{ height: '1px', backgroundColor: '#F8FAFC', marginLeft: '54px' }}></div>

              {/* Row 3 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Invite Friends</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>

            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ marginTop: '20px', marginBottom: '34px', marginX: '20px', padding: '0 20px' }}>
            <button style={{ width: '100%', height: '48px', backgroundColor: '#FFFFFF', border: '1px solid #FEE2E2', borderRadius: '14px', fontSize: '15px', fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px rgba(239, 68, 68, 0.05)' }}>
              Sign Out
            </button>
          </div>

        </div>

        {/* Bottom Navigation */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '84px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-around', paddingTop: '12px', paddingBottom: '34px', boxSizing: 'border-box', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Home</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Pay</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Calendar</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#5B5BE6', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span style={{ fontSize: '10px', fontWeight: 600 }}>Settings</span>
          </div>
        </div>

        {/* Home Indicator */}
        <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '134px', height: '5px', backgroundColor: '#000000', borderRadius: '100px', zIndex: 20 }}></div>
      </div>
    </div>
  );
}