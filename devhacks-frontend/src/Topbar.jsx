import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useApp } from "./context";

function Topbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { tasks } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count urgent notifications (overdue tasks)
  const urgentCount = tasks.filter(task => {
    if (task.status === 'completed' || !task.scheduledDate) return false;
    const taskDate = new Date(task.scheduledDate);
    return taskDate < new Date();
  }).length;

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.[0] || "U";

  const navLinkStyle = {
    padding: "6px 10px",
    borderRadius: "8px",
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.04)",
    whiteSpace: "nowrap",
  };

  const mobileNavLinkStyle = {
    padding: "14px 20px",
    borderRadius: "12px",
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    // width: "100%" - Removed to prevent overflow in flex column with padding
  };

  const navLinks = [
    { to: "/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/calendar", icon: "📅", label: "Calendar" },
    { to: "/subjects", icon: "📚", label: "Subjects" },
    { to: "/flashcards", icon: "🃏", label: "Flashcards" },
    { to: "/strategy", icon: "🎯", label: "Strategy" },
    { to: "/second-page", icon: "📋", label: "Tasks" },
    { to: "/electives", icon: "🎓", label: "Electives" },
    { to: "/resume", icon: "📄", label: "Resume" },
    { to: "/dsa", icon: "🧠", label: "DSA" }
  ];

  return (
    <>
      <div className="glass-panel topbar" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        position: "sticky", // Sticky positioning
        top: "10px",       // Stick 10px from top (accounting for parent padding if any, or just spacing)
        zIndex: 900,       // Ensure it stays above content
        overflow: "visible",
        marginBottom: "16px",
        background: "rgba(10, 15, 35, 0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Brand Section */}
        <div className="brand" style={{ flexShrink: 0 }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <h2 className="brand-title" style={{
              fontSize: "24px",
              background: "linear-gradient(135deg, #f1f5f9 0%, #6366f1 40%, #8b5cf6 70%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "800",
              letterSpacing: "-0.5px",
              animation: "titleGlow 3s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}>
              Adaptive Academic System
            </h2>
          </Link>
          <p className="brand-tagline" style={{
            fontSize: "9px",
            color: "#64748b",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulse 2s ease-in-out infinite"
            }}></span>
            PLAN • FOCUS • IMPROVE
          </p>
        </div>

        {/* Desktop Navigation Section */}
        <div className="desktop-nav" style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginLeft: "auto",
          marginRight: "12px",
          flexWrap: "nowrap",
        }}>
          {navLinks
            .filter(link => link.to !== "/dashboard") // Dashboard is already the brand link
            .map(link => (
              <Link key={link.to} to={link.to} className="nav-link" style={navLinkStyle}>
                {link.label}
              </Link>
            ))}
        </div>

        {/* Right Section */}
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {/* Notification Bell */}
          <Link
            to="/notifications"
            className="notification-btn"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              position: "relative",
              textDecoration: "none",
              color: "inherit"
            }}
          >
            🔔
            {urgentCount > 0 && (
              <span style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                minWidth: "18px",
                height: "18px",
                borderRadius: "9px",
                background: "#f43f5e",
                border: "2px solid #0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "700",
                color: "white",
                padding: "0 4px"
              }}>
                {urgentCount > 9 ? '9+' : urgentCount}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <Link
            to="/user"
            className="user-profile-btn"
            style={{
              textDecoration: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            {firstName[0].toUpperCase()}
          </Link>

          {/* Sign Out Button - Hidden on mobile */}
          <button
            onClick={() => signOut()}
            className="signout-btn"
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              background: "rgba(244, 63, 94, 0.1)",
              color: "#f43f5e",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ↪ Sign Out
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="hamburger-btn"
            style={{
              display: "none",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              cursor: "pointer",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              transition: "all 0.2s ease",
              zIndex: 1001 // Ensure button is clickable
            }}
          >
            <span style={{
              width: "18px",
              height: "2px",
              background: "#818cf8",
              borderRadius: "2px",
              transition: "all 0.3s ease",
              transform: mobileMenuOpen ? "rotate(45deg) translateY(7px)" : "none"
            }}></span>
            <span style={{
              width: "18px",
              height: "2px",
              background: "#818cf8",
              borderRadius: "2px",
              transition: "all 0.3s ease",
              opacity: mobileMenuOpen ? 0 : 1
            }}></span>
            <span style={{
              width: "18px",
              height: "2px",
              background: "#818cf8",
              borderRadius: "2px",
              transition: "all 0.3s ease",
              transform: mobileMenuOpen ? "rotate(-45deg) translateY(-7px)" : "none"
            }}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            animation: "fadeIn 0.2s ease-out"
          }}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            // Width is handled by CSS class below for responsiveness
            height: "100vh",
            background: "#0f172a",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px",
            boxSizing: "border-box", // Ensure padding doesn't overflow width
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "auto",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            animation: "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <span style={{ fontWeight: "700", fontSize: "18px", color: "#fff" }}>Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              ✕
            </button>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={mobileNavLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}

          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <button
              onClick={() => { signOut(); setMobileMenuOpen(false); }}
              style={{
                // width: "100%", // Removed to prevent overflow
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                background: "rgba(244, 63, 94, 0.1)",
                color: "#f43f5e",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                boxSizing: "border-box", // Explicitly ensure border-box
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              ↪ Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes titleGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .nav-link:hover {
          color: #6366f1 !important;
          background: rgba(99, 102, 241, 0.05);
          transform: translateY(-1px);
        }

        /* Mobile menu responsive width */
        .mobile-menu-container {
          width: 280px;
          max-width: 100vw; /* Prevent overflow on very small screens */
        }
        @media (max-width: 480px) {
          .mobile-menu-container {
            width: 100% !important;
            border-left: none !important;
          }
        }

        /* Large desktop — tighten brand */
        @media (max-width: 1400px) {
          .brand-title {
            font-size: 18px !important;
          }
          .brand-tagline {
            display: none !important;
          }
        }

        /* Tablet breakpoint */
        @media (max-width: 1200px) {
          .desktop-nav {
            gap: 4px !important;
          }
          .desktop-nav .nav-link {
            padding: 5px 8px !important;
            font-size: 12px !important;
          }
        }

        /* Mobile breakpoint — switch to hamburger */
        @media (max-width: 1100px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .signout-btn {
            display: none !important;
          }
          .topbar {
            padding: 12px 16px !important;
          }
          .brand-title {
            font-size: 18px !important;
          }
          .brand-tagline {
            display: none !important;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .brand-title {
            font-size: 16px !important;
          }
          .topbar-right {
            gap: 8px !important;
          }
          .notification-btn, .user-profile-btn {
            width: 32px !important;
            height: 32px !important;
          }
        }
      `}</style>
    </>
  );
}

export default Topbar;

