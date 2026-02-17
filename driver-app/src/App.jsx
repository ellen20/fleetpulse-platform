import { useState, useEffect, useCallback } from "react";

const API = "/api";

const COLORS = {
  bg: "#0a0f1a",
  surface: "#111827",
  surfaceLight: "#1a2235",
  border: "#1e293b",
  accent: "#22d3ee",
  accentDim: "rgba(34,211,238,0.12)",
  green: "#10b981",
  greenDim: "rgba(16,185,129,0.12)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.12)",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
};

// ---- API helpers ----
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---- Reusable Components ----
const StatusPill = ({ status }) => {
  const config = {
    pending: { color: COLORS.amber, bg: COLORS.amberDim, label: "Pending" },
    active: { color: COLORS.green, bg: COLORS.greenDim, label: "Active" },
    completed: { color: COLORS.accent, bg: COLORS.accentDim, label: "Completed" },
    cancelled: { color: COLORS.red, bg: COLORS.redDim, label: "Cancelled" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20, background: c.bg,
      color: c.color, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
      {c.label}
    </span>
  );
};

const BatteryDisplay = ({ level, size = "normal" }) => {
  const color = level > 60 ? COLORS.green : level > 30 ? COLORS.amber : COLORS.red;
  const isLarge = size === "large";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isLarge ? "center" : "flex-start", gap: 4 }}>
      {isLarge && <span style={{ fontSize: 36, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{level}%</span>}
      <div style={{ width: isLarge ? 120 : 80, height: isLarge ? 10 : 6, borderRadius: 5, background: COLORS.border, overflow: "hidden" }}>
        <div style={{ width: `${level}%`, height: "100%", borderRadius: 5, background: color, transition: "width 0.6s ease" }} />
      </div>
      {!isLarge && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{level}%</span>}
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 0", borderBottom: `1px solid ${COLORS.border}`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {icon && <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>}
      <span style={{ fontSize: 14, color: COLORS.textMuted }}>{label}</span>
    </div>
    <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>{value}</span>
  </div>
);

const Button = ({ children, onClick, variant = "primary", disabled, style: extraStyle }) => {
  const styles = {
    primary: { background: COLORS.accent, color: COLORS.bg },
    success: { background: COLORS.green, color: "#fff" },
    danger: { background: COLORS.red, color: "#fff" },
    outline: { background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}` },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
        fontSize: 15, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.2s", ...s, ...extraStyle,
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, ...style }}>
    {children}
  </div>
);

// ============================================================
// SCREENS
// ============================================================

// ---- LOGIN SCREEN ----
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api("/drivers/login", {
        method: "POST",
        body: JSON.stringify({ email, pin }),
      });
      onLogin(data.driver);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}>
          ⚡
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>FleetPulse</h1>
        <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 4 }}>Driver Portal</p>
      </div>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textDim, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Email</label>
            <input
              type="email"
              placeholder="driver@fleetpulse.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
                background: COLORS.surfaceLight, color: COLORS.text, fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textDim, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>PIN</label>
            <input
              type="password"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
                background: COLORS.surfaceLight, color: COLORS.text, fontSize: 15, outline: "none",
                letterSpacing: 8, textAlign: "center", boxSizing: "border-box",
              }}
            />
          </div>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: COLORS.redDim, color: COLORS.red, fontSize: 13 }}>
              {error}
            </div>
          )}
          <Button onClick={handleLogin} disabled={!email || !pin || loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </Card>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: COLORS.textDim }}>
        Demo credentials — see seed data for emails/PINs
      </div>
    </div>
  );
}

// ---- HOME SCREEN ----
function HomeScreen({ driver, onLogout, onViewAssignment }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/assignments?driver_id=${driver.id}`);
      setAssignments(data);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [driver.id]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const activeAssignments = assignments.filter((a) => a.status === "pending" || a.status === "active");
  const pastAssignments = assignments.filter((a) => a.status === "completed" || a.status === "cancelled");

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            Hi, {driver.name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 13, color: COLORS.textDim, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: "transparent", color: COLORS.textMuted, fontSize: 12, cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {/* Status Card */}
      <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${COLORS.surfaceLight}, ${COLORS.surface})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: driver.status === "on_trip" ? COLORS.greenDim : COLORS.accentDim,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>
            {driver.status === "on_trip" ? "🚗" : "✅"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {driver.status === "on_trip" ? "On Trip" : driver.status === "available" ? "Available" : "Off Duty"}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textDim }}>Driver ID: {driver.id}</div>
          </div>
        </div>
      </Card>

      {/* Active / Pending Assignments */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: COLORS.textMuted }}>Current Assignments</h2>
        {loading ? (
          <Card><div style={{ textAlign: "center", color: COLORS.textDim, padding: 20 }}>Loading...</div></Card>
        ) : activeAssignments.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 14, color: COLORS.textDim }}>No active assignments</div>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>
                Assignments will appear here when dispatched
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAssignments.map((a) => (
              <Card
                key={a.id}
                style={{ cursor: "pointer", borderColor: a.status === "active" ? COLORS.green : COLORS.amber }}
              >
                <div onClick={() => onViewAssignment(a)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{a.vehicle_code}</span>
                    <StatusPill status={a.status} />
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 4 }}>
                    {a.make} {a.vehicle_model}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: COLORS.textDim }}>
                      {a.notes || "No notes"}
                    </span>
                    <span style={{ fontSize: 12, color: COLORS.accent }}>View →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Assignments */}
      {pastAssignments.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: COLORS.textDim }}>History</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pastAssignments.slice(0, 5).map((a) => (
              <Card key={a.id} style={{ padding: 14, opacity: 0.7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.vehicle_code} — {a.make} {a.vehicle_model}</div>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
                      {new Date(a.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div style={{ marginTop: 20 }}>
        <Button variant="outline" onClick={loadAssignments}>↻ Refresh Assignments</Button>
      </div>
    </div>
  );
}

// ---- ASSIGNMENT DETAIL / ACTIVE SHIFT SCREEN ----
function AssignmentScreen({ assignment: initialAssignment, driver, onBack, onStatusChange }) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tripTime, setTripTime] = useState(0);
  const [telemetry, setTelemetry] = useState([]);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Load vehicle data
  useEffect(() => {
    api(`/vehicles/${assignment.vehicle_id}`).then(setVehicle).catch(console.error);
  }, [assignment.vehicle_id]);

  // Trip timer (counts seconds when active)
  useEffect(() => {
    if (assignment.status !== "active") return;
    const start = assignment.started_at ? new Date(assignment.started_at).getTime() : Date.now();
    const interval = setInterval(() => {
      setTripTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment.status, assignment.started_at]);

  // Simulate telemetry when active
  useEffect(() => {
    if (assignment.status !== "active" || !vehicle) return;
    const interval = setInterval(async () => {
      const newPoint = {
        vehicle_id: vehicle.id,
        assignment_id: assignment.id,
        battery_pct: Math.max(5, vehicle.current_battery_pct - Math.floor(Math.random() * 2)),
        speed_mph: 25 + Math.floor(Math.random() * 45),
        lat: parseFloat(vehicle.lat) + (Math.random() - 0.5) * 0.01,
        lng: parseFloat(vehicle.lng) + (Math.random() - 0.5) * 0.01,
        odometer: vehicle.odometer + Math.floor(Math.random() * 2),
        cabin_temp_f: vehicle.cabin_temp_f,
      };
      try {
        await api("/telemetry", { method: "POST", body: JSON.stringify(newPoint) });
        setTelemetry((prev) => [newPoint, ...prev].slice(0, 20));
        // Update local vehicle state
        setVehicle((v) => ({
          ...v,
          current_battery_pct: newPoint.battery_pct,
          lat: newPoint.lat,
          lng: newPoint.lng,
          odometer: newPoint.odometer,
        }));
      } catch (err) {
        console.error("Telemetry error:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [assignment.status, assignment.id, vehicle]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const updated = await api(`/assignments/${assignment.id}/start`, { method: "PATCH" });
      setAssignment(updated);
      onStatusChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const updated = await api(`/assignments/${assignment.id}/complete`, { method: "PATCH" });
      setAssignment(updated);
      onStatusChange();
      setConfirmEnd(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: COLORS.textDim, paddingTop: 80 }}>
        Loading vehicle data...
      </div>
    );
  }

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceLight, color: COLORS.text, fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Assignment #{assignment.id}</div>
          <div style={{ fontSize: 12, color: COLORS.textDim }}>
            {new Date(assignment.assigned_at).toLocaleString()}
          </div>
        </div>
        <StatusPill status={assignment.status} />
      </div>

      {/* Vehicle Card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Vehicle</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{vehicle.vehicle_code}</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 2 }}>{vehicle.make} {vehicle.model}</div>
          </div>
          <BatteryDisplay level={vehicle.current_battery_pct} size="large" />
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
          <InfoRow icon="📍" label="Range" value={`${vehicle.range_miles} mi`} />
          <InfoRow icon="🔧" label="Odometer" value={`${vehicle.odometer.toLocaleString()} mi`} />
          <InfoRow icon="🌡️" label="Cabin Temp" value={`${vehicle.cabin_temp_f}°F`} />
          <InfoRow icon="📋" label="VIN" value={vehicle.vin} />
        </div>
      </Card>

      {/* Trip Timer (when active) */}
      {assignment.status === "active" && (
        <Card style={{ marginBottom: 16, textAlign: "center", background: `linear-gradient(135deg, ${COLORS.greenDim}, ${COLORS.surface})`, borderColor: COLORS.green }}>
          <div style={{ fontSize: 11, color: COLORS.green, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Shift Duration</div>
          <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: COLORS.green, fontVariantNumeric: "tabular-nums" }}>
            {formatTime(tripTime)}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{vehicle.current_battery_pct}%</div>
              <div style={{ fontSize: 11, color: COLORS.textDim }}>Battery</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{telemetry.length > 0 ? telemetry[0].speed_mph : 0}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim }}>MPH</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{telemetry.length}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim }}>Data Points</div>
            </div>
          </div>
        </Card>
      )}

      {/* Notes */}
      {assignment.notes && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes</div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.5 }}>{assignment.notes}</div>
        </Card>
      )}

      {/* Recent Telemetry */}
      {telemetry.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Live Telemetry ({telemetry.length} points)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
            {telemetry.slice(0, 5).map((t, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "8px 10px",
                background: COLORS.surfaceLight, borderRadius: 8, fontSize: 12,
              }}>
                <span style={{ color: COLORS.textMuted }}>🔋 {t.battery_pct}%</span>
                <span style={{ color: COLORS.textMuted }}>⚡ {t.speed_mph} mph</span>
                <span style={{ color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                  {t.lat.toFixed(4)}, {t.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed summary */}
      {assignment.status === "completed" && (
        <Card style={{ marginBottom: 16, borderColor: COLORS.accent }}>
          <div style={{ textAlign: "center", padding: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Shift Completed</div>
            <div style={{ fontSize: 13, color: COLORS.textDim }}>
              Ended {new Date(assignment.completed_at).toLocaleTimeString()}
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: COLORS.redDim, color: COLORS.red, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assignment.status === "pending" && (
          <Button variant="success" onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "🚗  Start Shift"}
          </Button>
        )}

        {assignment.status === "active" && !confirmEnd && (
          <Button variant="danger" onClick={() => setConfirmEnd(true)}>
            🏁  End Shift
          </Button>
        )}

        {assignment.status === "active" && confirmEnd && (
          <>
            <Card style={{ textAlign: "center", borderColor: COLORS.amber, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>End your shift now?</div>
              <div style={{ fontSize: 12, color: COLORS.textDim }}>This will mark the trip as completed</div>
            </Card>
            <Button variant="danger" onClick={handleComplete} disabled={loading}>
              {loading ? "Completing..." : "Yes, End Shift"}
            </Button>
            <Button variant="outline" onClick={() => setConfirmEnd(false)}>Cancel</Button>
          </>
        )}

        {assignment.status === "completed" && (
          <Button variant="outline" onClick={onBack}>← Back to Home</Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function DriverApp() {
  const [driver, setDriver] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [screen, setScreen] = useState("login"); // login | home | assignment

  const handleLogin = (driverData) => {
    setDriver(driverData);
    setScreen("home");
  };

  const handleLogout = () => {
    setDriver(null);
    setCurrentAssignment(null);
    setScreen("login");
  };

  const handleViewAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setScreen("assignment");
  };

  const handleBack = () => {
    setCurrentAssignment(null);
    setScreen("home");
  };

  const handleStatusChange = async () => {
    // Refresh driver status
    if (driver) {
      try {
        const updated = await api(`/drivers/${driver.id}`);
        setDriver(updated);
      } catch (err) {
        console.error("Failed to refresh driver:", err);
      }
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: COLORS.bg,
      color: COLORS.text,
      minHeight: "100vh",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        input:focus { border-color: ${COLORS.accent} !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
      `}</style>

      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {screen === "login" && <LoginScreen onLogin={handleLogin} />}
        {screen === "home" && driver && (
          <HomeScreen
            driver={driver}
            onLogout={handleLogout}
            onViewAssignment={handleViewAssignment}
          />
        )}
        {screen === "assignment" && currentAssignment && driver && (
          <AssignmentScreen
            assignment={currentAssignment}
            driver={driver}
            onBack={handleBack}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
