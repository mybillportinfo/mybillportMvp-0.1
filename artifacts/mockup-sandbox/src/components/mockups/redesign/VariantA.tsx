export default function VariantA() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#111111", // Dark background outside the phone
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* iPhone 14 Pro Frame */}
      <div
        style={{
          width: "390px",
          height: "844px",
          backgroundColor: "#F5F0EB",
          borderRadius: "54px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 0 12px #1C1C1E, 0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "126px",
            height: "37px",
            backgroundColor: "#000000",
            borderRadius: "20px",
            zIndex: 100,
          }}
        />

        {/* Status Bar */}
        <div
          style={{
            height: "54px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 24px 12px",
            fontSize: "15px",
            fontWeight: "600",
            color: "#1A1A2E",
            zIndex: 90,
          }}
        >
          <span>9:41</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Signal */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <path d="M1 12h3V8H1v4zm5 0h3V6H6v6zm5 0h3V3h-3v9zm5 0h3V0h-3v12z" />
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 12L0 3.5C2.1 1.3 5 0 8 0s5.9 1.3 8 3.5L8 12z" />
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect
                x="1"
                y="1"
                width="21"
                height="10"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M24 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <rect x="3" y="3" width="15" height="6" rx="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: "100px", // space for bottom nav
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Header Area */}
          <div style={{ padding: "8px 20px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E" }}>
                MyBillPort
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Notification Bell */}
                <div style={{ position: "relative" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#FF6B8E",
                      borderRadius: "50%",
                      border: "2px solid #F5F0EB",
                    }}
                  />
                </div>
                {/* Avatar */}
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    backgroundColor: "#FF6B8E",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#FFFFFF",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  S
                </div>
              </div>
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "#1A1A2E",
                margin: "0 0 4px",
                letterSpacing: "-0.5px",
              }}
            >
              Good morning, Sarah 👋
            </h1>
            <p style={{ fontSize: "15px", color: "#6B7280", margin: 0 }}>
              Here's your bill snapshot
            </p>
          </div>

          {/* Hero Summary Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              margin: "0 20px 24px",
              padding: "24px",
              boxShadow: "rgba(0,0,0,0.06) 0 8px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#6B7280",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                  }}
                >
                  Due this week
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#1A1A2E",
                    letterSpacing: "-1px",
                  }}
                >
                  $487.48
                </div>
              </div>

              {/* CSS Donut Chart */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "conic-gradient(#DC2626 0% 25%, #F59E0B 25% 60%, #E5E7EB 60% 100%)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "50%",
                  }}
                />
              </div>
            </div>

            {/* Stat Pills */}
            <div style={{ display: "flex", gap: "8px" }}>
              <div
                style={{
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  borderRadius: "100px",
                }}
              >
                1 Overdue
              </div>
              <div
                style={{
                  backgroundColor: "#F59E0B",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  borderRadius: "100px",
                }}
              >
                2 Due Soon
              </div>
              <div
                style={{
                  backgroundColor: "#00B37E",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  borderRadius: "100px",
                }}
              >
                5 Paid
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "0 20px",
              marginBottom: "32px",
            }}
          >
            <button
              style={{
                flex: 1,
                backgroundColor: "#FF6B8E",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "16px",
                padding: "16px 0",
                fontSize: "15px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Bill
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                color: "#FF6B8E",
                border: "1.5px solid #FF6B8E",
                borderRadius: "16px",
                padding: "16px 0",
                fontSize: "15px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Scan
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                color: "#FF6B8E",
                border: "1.5px solid #FF6B8E",
                borderRadius: "16px",
                padding: "16px 0",
                fontSize: "15px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              AI Chat
            </button>
          </div>

          {/* Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "0 20px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", margin: 0 }}>
              Needs Attention
            </h2>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#FF6B8E" }}>
              See all →
            </span>
          </div>

          {/* Bill Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px" }}>
            
            {/* Card 1 - Rogers */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "rgba(0,0,0,0.04) 0 4px 12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#FEE2E2",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#DC2626",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginRight: "16px",
                }}
              >
                R
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A2E", marginBottom: "4px" }}>
                  Rogers Wireless
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Due May 8 · <span style={{ color: "#DC2626" }}>7 days ago</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", marginBottom: "6px" }}>
                  $89.99
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "100px",
                  }}
                >
                  OVERDUE
                </div>
              </div>
            </div>

            {/* Card 2 - Hydro One */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "rgba(0,0,0,0.04) 0 4px 12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#FEF3C7",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#D97706",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginRight: "16px",
                }}
              >
                H
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A2E", marginBottom: "4px" }}>
                  Hydro One
                </div>
                <div style={{ fontSize: "13px", color: "#D97706", fontWeight: "600" }}>
                  Due Today
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", marginBottom: "6px" }}>
                  $134.50
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "100px",
                  }}
                >
                  DUE TODAY
                </div>
              </div>
            </div>

            {/* Card 3 - Bell Internet */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "rgba(0,0,0,0.04) 0 4px 12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#DBEAFE",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#2563EB",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginRight: "16px",
                }}
              >
                B
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A2E", marginBottom: "4px" }}>
                  Bell Internet
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Due May 12
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", marginBottom: "6px" }}>
                  $79.99
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "100px",
                  }}
                >
                  UPCOMING
                </div>
              </div>
            </div>
            
            {/* Additional cards implied by instructions */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "rgba(0,0,0,0.04) 0 4px 12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#E0E7FF",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#4F46E5",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginRight: "16px",
                }}
              >
                N
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A2E", marginBottom: "4px" }}>
                  Netflix
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Due May 15
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", marginBottom: "6px" }}>
                  $17.99
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "100px",
                  }}
                >
                  UPCOMING
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "rgba(0,0,0,0.04) 0 4px 12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#DCFCE7",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#16A34A",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginRight: "16px",
                }}
              >
                E
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A2E", marginBottom: "4px" }}>
                  Enbridge
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Due May 20
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E", marginBottom: "6px" }}>
                  $211.00
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "100px",
                  }}
                >
                  UPCOMING
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "90px",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #F0F0F0",
            display: "flex",
            justifyContent: "space-around",
            paddingTop: "16px",
            paddingBottom: "24px", // Safe area
            zIndex: 90,
          }}
        >
          {/* Home Tab (Active) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "64px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF6B8E" stroke="#FF6B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#FF6B8E" }}>Home</span>
          </div>

          {/* Bills Tab */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "64px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#9CA3AF" }}>Bills</span>
          </div>

          {/* Calendar Tab */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "64px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#9CA3AF" }}>Calendar</span>
          </div>

          {/* Settings Tab */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "64px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#9CA3AF" }}>Settings</span>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "134px",
            height: "5px",
            backgroundColor: "#1A1A2E",
            borderRadius: "100px",
            zIndex: 100,
          }}
        />

      </div>
    </div>
  );
}
