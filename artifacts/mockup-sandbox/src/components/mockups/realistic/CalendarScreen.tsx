export default function CalendarScreen() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5E7EB', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      
      {/* iPhone 14 Pro Frame */}
      <div style={{ position: 'relative', width: 390, height: 844, backgroundColor: '#F8FAFC', borderRadius: 54, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 12px #1C1C1E, 0 0 0 14px #4B5563' }}>
        
        {/* Phone Chrome (Status Bar + Dynamic Island) */}
        <div style={{ height: 50, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', paddingTop: 12, position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.3px' }}>9:41</div>
          
          {/* Dynamic Island */}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, backgroundColor: '#000000', borderRadius: 20 }}></div>
          
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Signal */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 11H3V8H1V11ZM5 11H7V5H5V11ZM9 11H11V2H9V11ZM13 11H15V0H13V11Z" fill="#0F172A"/>
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12C10.0543 12 11.9543 11.1687 13.3333 9.80528L8 3.51056L2.66667 9.80528C4.04565 11.1687 5.94565 12 8 12ZM8 0C3.58185 0 0 3.58185 0 8H2.18182C2.18182 4.78655 4.78655 2.18182 8 2.18182C11.2135 2.18182 13.8182 4.78655 13.8182 8H16C16 3.58185 12.4182 0 8 0Z" fill="#0F172A"/>
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#0F172A"/>
              <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#0F172A"/>
              <path d="M24 4V8" stroke="#0F172A" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ height: 'calc(100% - 50px - 84px)', overflowY: 'auto', paddingBottom: 24 }}>
          
          {/* HEADER */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px 12px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 20, color: '#5B5BE6', width: 24, cursor: 'pointer' }}>←</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>Cash Flow</div>
              <div style={{ width: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
            
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 20, color: '#94A3B8', padding: '4px 8px', cursor: 'pointer' }}>‹</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>May 2026</div>
              <div style={{ fontSize: 20, color: '#94A3B8', padding: '4px 8px', cursor: 'pointer' }}>›</div>
            </div>
          </div>

          {/* SUMMARY STRIP */}
          <div style={{ backgroundColor: '#EEF2FF', margin: '12px 20px 0', padding: 12, borderRadius: 12, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>💰 Income</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#10B981', marginTop: 4 }}>$4,200</div>
            </div>
            <div style={{ width: 1, height: 32, backgroundColor: '#E2E8F0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>📤 Bills</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#EF4444', marginTop: 4 }}>$892</div>
            </div>
            <div style={{ width: 1, height: 32, backgroundColor: '#E2E8F0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>✓ Net</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#5B5BE6', marginTop: 4 }}>+$3,308</div>
            </div>
          </div>

          {/* CALENDAR GRID */}
          <div style={{ margin: '16px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, textAlign: 'center', padding: '4px 0' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0', rowGap: 8 }}>
              {/* WEEK 1 */}
              <div></div><div></div><div></div><div></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#EF4444', fontWeight: 600 }}>1</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>2</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>3</div>
              </div>

              {/* WEEK 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>4</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>5</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>6</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>7</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A', fontWeight: 600 }}>8</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', marginTop: -4 }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>9</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>10</div>
              </div>

              {/* WEEK 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>11</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A', fontWeight: 600 }}>12</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: -4 }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>13</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>14</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A', fontWeight: 600 }}>15</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: -4 }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>16</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>17</div>
              </div>

              {/* WEEK 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>18</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>19</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A', fontWeight: 600 }}>20</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', marginTop: -4 }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#5B5BE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFFFFF', fontWeight: 700, boxShadow: '0 4px 12px rgba(91, 91, 230, 0.3)' }}>21</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>22</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>23</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>24</div>
              </div>

              {/* WEEK 5 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42, position: 'relative' }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#10B981', fontWeight: 700 }}>25</div>
                <div style={{ fontSize: 8, marginTop: -6, lineHeight: 1 }}>💚</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', marginTop: 2 }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>26</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>27</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>28</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>29</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>30</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 42 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0F172A' }}>31</div>
              </div>
            </div>
          </div>

          {/* BILLS THIS MONTH */}
          <div style={{ margin: '24px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Bills This Month</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>8 total</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              
              {/* Bill 1 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F8FAFC' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', marginRight: 12 }}></div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>Rogers Wireless</div>
                <div style={{ flex: 1 }}></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginRight: 12 }}>$89.99</div>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>OVERDUE</div>
              </div>

              {/* Bill 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F8FAFC' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B', marginRight: 12 }}></div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>Hydro One</div>
                <div style={{ flex: 1 }}></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginRight: 12 }}>$134.50</div>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#FFFBEB', color: '#F59E0B', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>TODAY</div>
              </div>

              {/* Bill 3 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6', marginRight: 12 }}></div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>Bell Internet</div>
                <div style={{ flex: 1 }}></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginRight: 12 }}>$79.99</div>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#EFF6FF', color: '#3B82F6', fontSize: 11, fontWeight: 600 }}>May 12</div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', paddingBottom: 34, display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 20 }}>
          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>Home</span>
          </div>
          
          {/* Calendar (Active) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B5BE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#5B5BE6' }}>Calendar</span>
          </div>
          
          {/* Pay */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 16px', marginTop: -16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#5B5BE6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91, 91, 230, 0.3)', border: '4px solid #FFFFFF' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>Pay</span>
          </div>

          {/* AI */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
              <path d="M12 12l8.66-5"></path>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>Insights</span>
          </div>
          
          {/* Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>Menu</span>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, backgroundColor: '#000000', borderRadius: 100, zIndex: 30 }}></div>
      </div>
    </div>
  );
}