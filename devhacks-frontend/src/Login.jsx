import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

function Login() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        background: "#030712",
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)
        `,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Animated Floating Orbs */}
      <div style={{
        position: "absolute",
        top: "-20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float1 15s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-30%",
        right: "-15%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        filter: "blur(80px)",
        animation: "float2 20s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "800px",
        height: "800px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)",
        filter: "blur(100px)",
        animation: "pulse 8s ease-in-out infinite"
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none"
      }} />

      {/* Login Container */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px"
      }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h1 style={{
            fontSize: "40px", // Reduced from 48px
            fontWeight: "800",
            background: "linear-gradient(135deg, #f1f5f9 0%, #6366f1 40%, #8b5cf6 70%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1px",
            marginBottom: "12px",
            animation: "titleGlow 3s ease-in-out infinite"
          }}>
            Adaptive Academic System
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "14px", // Reduced from 16px
            letterSpacing: "4px", // Reduced from 5px
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulseGreen 2s ease-in-out infinite"
            }} />
            PLAN • FOCUS • IMPROVE
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.15)",
          overflow: "hidden"
        }}>
          <SignIn
            forceRedirectUrl="/dashboard"
            appearance={{
              baseTheme: dark,
              variables: {
                fontSize: "1rem", // Reduced from 1.1rem
                fontWeight: {
                  normal: 500,
                  medium: 600,
                  bold: 700
                }
              },
              elements: {
                rootBox: {
                  boxShadow: "none"
                },
                card: {
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                  padding: "20px" // Add some padding for better centering look
                },
                headerTitle: {
                  fontSize: "1.6rem" // Reduced from 1.8rem
                }
              }
            }}
          />
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 20px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes titleGlow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4)); }
          50% { filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.6)); }
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
        }
      `}</style>
    </div>
  );
}

export default Login;
