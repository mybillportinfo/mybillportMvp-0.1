export default function VariantC() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* iPhone 14 Pro Frame */}
      <div style={{ position: 'relative', width: '390px', height: '844px', backgroundColor: '#0A0A0A', borderRadius: '48px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 0 0 12px #1C1C1E, 0 0 0 14px #333333' }}>
        
        {/* Dynamic Island / Notch Area */}
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '32px', backgroundColor: '#000000', borderRadius: '24px', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#111' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '2px solid #222' }}></div>
        </div>

        {/* Screen Content */}
        <div style={{ width: '100%', height: '100%', backgroundColor: '#090E1A', color: '#F8FAFC', position: 'relative', overflowY: 'auto', paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 8px', fontSize: '15px', fontWeight: '600', zIndex: 40, position: 'relative' }}>
            <span style={{ paddingLeft: '8px' }}>9:41</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M1 9.5C1.5 9 3 8 5 8M1 6.5C2 5.5 4 4 7 4M1 3.5C2.5 2 5 0.5 9 0.5C13 0.5 15.5 2 17 3.5M13 8C15 8 16.5 9 17 9.5M11 4C14 4 16 5.5 17 6.5M9 11.5C9.55228 11.5 10 11.0523 10 10.5C10 9.94772 9.55228 9.5 9 9.5C8.44772 9.5 8 9.94772 8 10.5C8 11.0523 8.44772 11.5 9 11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 11.5C12.4183 11.5 16 7.91828 16 3.5C16 2.5 15.5 1.5 15 1L1 1C0.5 1.5 0 2.5 0 3.5C0 7.91828 3.58172 11.5 8 11.5Z" fill="white"/>
              </svg>
              <div style={{ width: '24px', height: '12px', border: '1px solid white', borderRadius: '4px', position: 'relative', padding: '1px' }}>
                <div style={{ width: '16px', height: '100%', backgroundColor: 'white', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', right: '-3px', top: '3px', width: '2px', height: '4px', backgroundColor: 'white', borderRadius: '0 2px 2px 0' }}></div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #818CF8)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)' }}>
                M
              </div>
              <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' }}>MyBillPort</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div style={{ position: 'absolute', top: '-2px', right: '0px', width: '8px', height: '8px', backgroundColor: '#FF6B6B', borderRadius: '50%', border: '2px solid #090E1A' }}></div>
              </div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #EC4899)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                S
              </div>
            </div>
          </div>

          {/* Hero Wallet Card */}
          <div style={{ margin: '12px 16px 24px', position: 'relative' }}>
            <div style={{ width: '100%', borderRadius: '28px', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)', padding: '28px 24px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)' }}>
              
              {/* Shimmer overlay */}
              <div style={{ position: 'absolute', top: 0, left: '-50%', width: '200%', height: '100%', background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 55%, transparent 60%)', zIndex: 1, pointerEvents: 'none' }}></div>
              
              {/* Abstract shapes for depth */}
              <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', left: '-30px', bottom: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600', marginBottom: '8px' }}>Total Due</div>
                    <div style={{ fontSize: '42px', fontWeight: '800', color: 'white', letterSpacing: '-1px', lineHeight: '1', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '24px', marginTop: '4px', marginRight: '2px', fontWeight: '600' }}>$</span>
                      487.48
                    </div>
                  </div>
                  <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                    </svg>
                  </div>
                </div>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '24px 0 16px' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💳</span>
                    <span>3 bills overdue or due soon</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span>
                    <span>May 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#06FFA5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Add</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Scan</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#06FFA5' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M9 10h.01"></path>
                  <path d="M15 10h.01"></path>
                  <path d="M12 10h.01"></path>
                </svg>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>AI Help</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Stats</span>
            </div>
          </div>

          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Needs Attention</h2>
            <span style={{ fontSize: '13px', color: '#06FFA5', fontWeight: '600' }}>View all</span>
          </div>

          {/* Bill Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
            
            {/* Card 1 - Overdue */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 107, 107, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FF6B6B', fontSize: '20px', fontWeight: 'bold' }}>
                R
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Rogers Wireless</div>
                <div style={{ fontSize: '12px', color: '#FF6B6B', fontWeight: '500' }}>7 days overdue</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>$89.99</div>
                <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                  OVERDUE
                </div>
              </div>
            </div>

            {/* Card 2 - Due Today */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 186, 8, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFBA08', fontSize: '20px', fontWeight: 'bold' }}>
                H
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Hydro One</div>
                <div style={{ fontSize: '12px', color: '#FFBA08', fontWeight: '500' }}>Due today</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>$134.50</div>
                <div style={{ backgroundColor: 'rgba(255, 186, 8, 0.15)', color: '#FFBA08', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                  TODAY
                </div>
              </div>
            </div>

            {/* Card 3 - Upcoming */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6366F1', fontSize: '20px', fontWeight: 'bold' }}>
                B
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Bell Internet</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>Due May 12</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>$79.99</div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                  MAY 12
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: 'rgba(9, 14, 26, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 32px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
          
          {/* Active Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', width: '60px' }}>
            <div style={{ position: 'absolute', top: '-16px', width: '24px', height: '3px', backgroundColor: '#6366F1', borderRadius: '0 0 4px 4px' }}></div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span style={{ fontSize: '10px', color: '#6366F1', fontWeight: '700' }}>Home</span>
          </div>

          {/* Inactive Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '60px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <span style={{ fontSize: '10px', color: '#475569', fontWeight: '500' }}>Bills</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '60px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style={{ fontSize: '10px', color: '#475569', fontWeight: '500' }}>Calendar</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '60px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span style={{ fontSize: '10px', color: '#475569', fontWeight: '500' }}>Settings</span>
          </div>

        </div>

      </div>
    </div>
  );
}
