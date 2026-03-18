import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  bg: "#0a0f1a",
  surface: "#111827",
  surfaceLight: "#1a2235",
  border: "#1e293b",
  accent: "#22d3ee",
  accentDim: "rgba(34,211,238,0.12)",
  green: "#10b981",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.12)",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
};

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Already logged in → go to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .login-input:focus { outline: none; border-color: ${COLORS.accent} !important; box-shadow: 0 0 0 3px ${COLORS.accentDim}; }
        .login-btn:hover:not(:disabled) { background: #06b6d4 !important; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .demo-card:hover { border-color: ${COLORS.accent} !important; cursor: pointer; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 420,
        animation: "fadeIn 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, boxShadow: `0 0 32px rgba(34,211,238,0.3)`,
          }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>
            FleetPulse
          </h1>
          <p style={{ fontSize: 13, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 2 }}>
            Fleet Management Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: 32,
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24 }}>
            Enter your credentials to access the dashboard
          </p>

          {/* Error message */}
          {error && (
            <div
              data-testid="login-error"
              style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: COLORS.redDim, border: `1px solid ${COLORS.red}`,
                color: COLORS.red, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Email
              </label>
              <input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fleetpulse.com"
                autoComplete="email"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
                  color: COLORS.text, fontSize: 14, transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "10px 42px 10px 14px", borderRadius: 8,
                    border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
                    color: COLORS.text, fontSize: 14, transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  className="login-input"
                />
                <button
                  type="button"
                  data-testid="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: COLORS.textDim,
                    cursor: "pointer", fontSize: 16, padding: 2,
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              data-testid="login-submit"
              onClick={handleSubmit}
              disabled={loading}
              className="login-btn"
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                border: "none", background: COLORS.accent, color: COLORS.bg,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: 0.3,
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 20, padding: 16,
          background: COLORS.surfaceLight,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            🔑 Demo Credentials
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { role: "Manager", email: "manager@fleetpulse.com", password: "manager123", color: COLORS.accent },
              { role: "Viewer", email: "viewer@fleetpulse.com", password: "viewer123", color: COLORS.green },
            ].map((cred) => (
              <div
                key={cred.role}
                data-testid={`demo-${cred.role.toLowerCase()}`}
                className="demo-card"
                onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                style={{
                  padding: "8px 12px", borderRadius: 8,
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: cred.color }}>{cred.role}</span>
                  <span style={{ fontSize: 10, color: COLORS.textDim }}>click to fill</span>
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{cred.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
