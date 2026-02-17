import { useState, useEffect } from "react";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const API_BASE = "/api";
const REFRESH_INTERVAL = 10000; // 10 seconds

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
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
};

const MAP_BOUNDS = { minLat: 29.50, maxLat: 30.00, minLng: -95.70, maxLng: -95.10 };

const VEHICLE_EMOJIS = {
  Tesla: "🔋", Rivian: "🚙", Ford: "🚚", Chevy: "⚡", Chevrolet: "⚡",
  Hyundai: "🔌", BMW: "🏎️", Kia: "🚗", Nissan: "🔋",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const toMapX = (lng) => ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
const toMapY = (lat) => (1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
const getVehicleEmoji = (make) => VEHICLE_EMOJIS[make] || "🚙";

const getStatusColor = (status) => {
  const colors = {
    available: COLORS.green,
    charging: COLORS.accent,
    maintenance: COLORS.red,
    pending: COLORS.amber,
    active: COLORS.purple,
  };
  return colors[status] || COLORS.green;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const StatusBadge = ({ status }) => {
  const config = {
    available: { color: COLORS.green, bg: COLORS.greenDim, label: "Available" },
    charging: { color: COLORS.accent, bg: COLORS.accentDim, label: "Charging" },
    maintenance: { color: COLORS.red, bg: COLORS.redDim, label: "Maintenance" },
    on_trip: { color: COLORS.purple, bg: COLORS.purpleDim, label: "On Trip" },
    off_duty: { color: COLORS.amber, bg: COLORS.amberDim, label: "Off Duty" },
    pending: { color: COLORS.amber, bg: COLORS.amberDim, label: "Pending" },
    active: { color: COLORS.green, bg: COLORS.greenDim, label: "Active" },
  };
  const c = config[status] || config.available;
  
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
      borderRadius: 20, background: c.bg, color: c.color, fontSize: 11,
      fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
      {c.label}
    </span>
  );
};

const BatteryBar = ({ level }) => {
  const color = level > 60 ? COLORS.green : level > 30 ? COLORS.amber : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 8, borderRadius: 4, background: COLORS.border, overflow: "hidden" }}>
        <div style={{ width: `${level}%`, height: "100%", borderRadius: 4, background: color, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: COLORS.textMuted, fontVariantNumeric: "tabular-nums" }}>{level}%</span>
    </div>
  );
};

const Card = ({ children, style, ...props }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, ...style }} {...props}>
    {children}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FleetDashboard() {
  const [time, setTime] = useState(new Date());
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("map");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(null);
  const [mapHover, setMapHover] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [vehicleListPage, setVehicleListPage] = useState(1);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAllData = async () => {
    try {
      const [vehiclesRes, driversRes, assignmentsRes, stationsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles`),
        fetch(`${API_BASE}/drivers`),
        fetch(`${API_BASE}/assignments`),
        fetch(`${API_BASE}/charging-stations`).catch(() => ({ ok: false })),
      ]);

      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
      if (driversRes.ok) setDrivers(await driversRes.json());
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
      if (stationsRes.ok) setStations(await stationsRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    }
  };

  const handleAssign = async (vehicleId, driverId) => {
    try {
      const res = await fetch(`${API_BASE}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id: vehicleId, driver_id: driverId }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message || 'Assignment created'}`);
        setShowDriverModal(false);
        setSelectedDriver(null);
        fetchAllData();
      } else {
        const err = await res.json();
        alert(`❌ ${err.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm("Cancel this assignment? The driver has not accepted yet.")) return;
    
    try {
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/cancel`, { method: "PATCH" });
      if (res.ok) {
        alert("✅ Assignment cancelled");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(`❌ ${err.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getVehicleAssignment = (vehicleId) => {
    return assignments.find(a => a.vehicle_id === vehicleId && (a.status === 'pending' || a.status === 'active'));
  };

  const getDriverAssignment = (driverId) => {
    return assignments.find(a => a.driver_id === driverId && (a.status === 'pending' || a.status === 'active'));
  };

  const getVehicleMapColor = (vehicle) => {
    if (vehicle.status === "charging") return COLORS.accent;
    if (vehicle.status === "maintenance") return COLORS.red;
    
    const assignment = getVehicleAssignment(vehicle.id);
    if (assignment) {
      return assignment.status === "pending" ? COLORS.amber : COLORS.purple;
    }
    
    return COLORS.green;
  };

  const counts = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    charging: vehicles.filter(v => v.status === "charging").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: COLORS.bg, color: COLORS.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <div style={{ fontSize: 18, color: COLORS.textMuted }}>Loading FleetPulse...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: COLORS.bg, color: COLORS.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px",
        borderBottom: `1px solid ${COLORS.border}`, background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>FleetPulse</div>
            <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Fleet Management Dashboard
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 2, background: COLORS.surfaceLight, borderRadius: 8, padding: 3 }}>
          {["map", "assignments"].map((tab) => (
            <button key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => {
              setActiveTab(tab);
              setSelectedVehicle(null);
              setSelectedStation(null);
              setStatusFilter("all");
            }} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500, textTransform: "capitalize", transition: "all 0.2s",
              background: activeTab === tab ? COLORS.accent : "transparent",
              color: activeTab === tab ? COLORS.bg : COLORS.textMuted,
            }}>
              {tab === "map" ? "🗺️ Fleet Map" : "📋 Assignments"}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>
            {vehicles.length} Vehicles • {drivers.length} Drivers
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.textMuted }}>
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 8px ${COLORS.green}`, animation: "pulse 2s infinite" }} />
        </div>
      </header>

      <main style={{ flex: 1, padding: 24, maxWidth: 1600, margin: "0 auto", width: "100%" }}>
        
        {/* TAB 1: FLEET MAP */}
        {activeTab === "map" && (
          <div style={{ animation: "slideUp 0.3s ease" }} data-testid="tab-content-map">
            {/* Status Cards - Clickable Filters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} data-testid="status-cards">
              {[
                { label: "Total Fleet", status: "all", icon: "📊", count: counts.total, color: COLORS.accent },
                { label: "Available", status: "available", icon: "✅", count: counts.available, color: COLORS.green },
                { label: "Charging", status: "charging", icon: "⚡", count: counts.charging, color: COLORS.accent },
                { label: "Maintenance", status: "maintenance", icon: "🔧", count: counts.maintenance, color: COLORS.red },
              ].map(item => {
                const isActive = statusFilter === item.status;
                return (
                  <Card key={item.label}
                    data-testid={`status-card-${item.status}`}
                    style={{
                    padding: 12, borderLeft: `3px solid ${item.color}`, cursor: "pointer",
                    background: isActive ? COLORS.surfaceLight : COLORS.surface,
                    border: `1px solid ${isActive ? item.color : COLORS.border}`,
                    transition: "all 0.2s"
                  }}
                  onClick={() => { setStatusFilter(isActive ? "all" : item.status); setVehicleListPage(1); }}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      {item.icon} {item.label}
                    </div>
                    <div data-testid={`status-count-${item.status}`} style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.count}</div>
                  </Card>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
              {/* Map */}
              <Card style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: 600 }}>
                <svg viewBox="0 0 100 100" style={{
                  width: "100%", height: "100%", position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at 40% 40%, ${COLORS.surfaceLight} 0%, ${COLORS.bg} 100%)`
                }} preserveAspectRatio="xMidYMid meet">
                  
                  <g transform={`scale(${mapZoom})`}>
                    {/* Grid */}
                    {Array.from({ length: 11 }).map((_, i) => (
                      <g key={`grid-${i}`}>
                        <line x1={i * 10} y1={0} x2={i * 10} y2={100} stroke={COLORS.border} strokeWidth="0.2" strokeDasharray="2,3" />
                        <line x1={0} y1={i * 10} x2={100} y2={i * 10} stroke={COLORS.border} strokeWidth="0.2" strokeDasharray="2,3" />
                      </g>
                    ))}

                    {/* Landmarks */}
                    {[
                      { name: "Downtown", lat: 29.7604, lng: -95.3698 },
                      { name: "Galleria", lat: 29.7380, lng: -95.4620 },
                      { name: "Energy Corridor", lat: 29.7720, lng: -95.5400 },
                    ].map((lm) => (
                      <g key={lm.name}>
                        <circle cx={toMapX(lm.lng)} cy={toMapY(lm.lat)} r={6} fill={COLORS.surfaceLight} opacity={0.3} />
                        <text x={toMapX(lm.lng)} y={toMapY(lm.lat) + 1} fill={COLORS.textDim} fontSize="2.5" textAnchor="middle" fontWeight="500" opacity={0.5}>
                          {lm.name}
                        </text>
                      </g>
                    ))}

                    {/* Charging Stations */}
                    {stations.map((s, i) => {
                      const isSelected = selectedStation?.id === s.id;
                      return (
                        <g key={`station-${i}`} onClick={() => setSelectedStation(isSelected ? null : s)} style={{ cursor: "pointer" }}>
                          <rect x={toMapX(s.lng) - 2.5} y={toMapY(s.lat) - 2.5} width={5} height={5} rx={0.6}
                                fill={isSelected ? COLORS.accent : COLORS.accentDim} 
                                stroke={COLORS.accent} strokeWidth={isSelected ? 0.5 : 0.3} />
                          <text x={toMapX(s.lng)} y={toMapY(s.lat) + 1.2} fill={COLORS.accent} fontSize="3.5" textAnchor="middle" fontWeight="700">⚡</text>
                        </g>
                      );
                    })}

                    {/* Vehicle Pins */}
                    {vehicles
                      .filter(v => statusFilter === "all" || v.status === statusFilter)
                      .map((v) => {
                      if (!v.lat || !v.lng) return null;
                      const x = toMapX(v.lng);
                      const y = toMapY(v.lat);
                      const color = getVehicleMapColor(v);
                      const isSelected = selectedVehicle?.id === v.id;
                      const isHovered = mapHover === v.id;
                      const assignment = getVehicleAssignment(v.id);
                      
                      return (
                        <g key={v.id} onClick={() => setSelectedVehicle(isSelected ? null : v)}
                           onMouseEnter={() => setMapHover(v.id)} onMouseLeave={() => setMapHover(null)}
                           style={{ cursor: "pointer" }}>
                          
                          {assignment && (
                            <circle cx={x} cy={y} r={4} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4}>
                              <animate attributeName="r" from="3" to="7" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          
                          <circle cx={x} cy={y} r={isSelected ? 5 : isHovered ? 4.5 : 4} fill={color} opacity={0.2} />
                          <circle cx={x} cy={y} r={isSelected ? 2.5 : 2} fill={color} stroke={isSelected ? "#fff" : color} strokeWidth={isSelected ? 0.5 : 0.3} />
                          
                          {(isHovered || isSelected) && (
                            <g>
                              <rect x={x - 10} y={y - 7} width={20} height={5} rx={1}
                                    fill={COLORS.surface} stroke={color} strokeWidth={0.3} opacity={0.95} />
                              <text x={x} y={y - 4} fill={COLORS.text} fontSize="2.2" textAnchor="middle" fontWeight="600">
                                {v.vehicle_code}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Zoom Controls */}
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "+", action: () => setMapZoom(prev => Math.min(prev + 0.2, 3)) },
                    { label: "−", action: () => setMapZoom(prev => Math.max(prev - 0.2, 0.5)) },
                    { label: "⟲", action: () => setMapZoom(1) },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.action} style={{
                      width: 36, height: 36, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                      background: "rgba(17,24,39,0.9)", backdropFilter: "blur(8px)",
                      color: COLORS.text, cursor: "pointer", fontSize: i === 2 ? 16 : 18, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div style={{
                  position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12,
                  background: "rgba(10,15,26,0.9)", padding: "8px 12px", borderRadius: 8,
                  backdropFilter: "blur(8px)", border: `1px solid ${COLORS.border}`
                }}>
                  {[
                    { label: "Available", color: COLORS.green },
                    { label: "Pending", color: COLORS.amber },
                    { label: "Active", color: COLORS.purple },
                    { label: "Charging", color: COLORS.accent },
                    { label: "Maintenance", color: COLORS.red },
                    { label: "Charger", color: COLORS.accent, icon: "⚡" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: COLORS.textMuted }}>
                      {item.icon ? (
                        <span style={{ fontSize: 10 }}>{item.icon}</span>
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, boxShadow: `0 0 4px ${item.color}` }} />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Right Panel - Vehicle List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Vehicle List Card */}
                <Card style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, marginBottom: 10, color: COLORS.textMuted,
                    textTransform: "uppercase", letterSpacing: 1, display: "flex",
                    justifyContent: "space-between", alignItems: "center"
                  }}>
                    <span>Fleet Vehicles</span>
                    <span style={{ fontSize: 11, color: COLORS.accent }}>
                      {vehicles.filter(v => statusFilter === "all" || v.status === statusFilter).length} vehicles
                    </span>
                  </div>

                  {(() => {
                    const itemsPerPage = 10;
                    const filteredVehicles = vehicles
                      .filter(v => statusFilter === "all" || v.status === statusFilter)
                      .sort((a, b) => a.vehicle_code.localeCompare(b.vehicle_code));
                    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
                    const startIndex = (vehicleListPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

                    return (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto", marginBottom: 12 }} data-testid="vehicle-list">
                          {paginatedVehicles.map((v) => {
                            const assignment = getVehicleAssignment(v.id);
                            const mapColor = getVehicleMapColor(v);
                            const isSelected = selectedVehicle?.id === v.id;
                            
                            return (
                              <div key={v.id}
                                data-testid={`vehicle-list-item-${v.vehicle_code}`}
                                onClick={() => setSelectedVehicle(isSelected ? null : v)}
                                   onMouseEnter={() => setMapHover(v.id)} onMouseLeave={() => setMapHover(null)}
                                   style={{
                                     display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                                     background: isSelected ? COLORS.surfaceLight : "transparent",
                                     border: `1px solid ${isSelected ? mapColor : COLORS.border}`,
                                     borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                                   }}>
                                <div style={{
                                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                  background: mapColor,
                                  boxShadow: `0 0 6px ${mapColor}`,
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>
                                      {v.vehicle_code}
                                    </span>
                                    <StatusBadge status={v.status} />
                                  </div>
                                  
                                  <div style={{ fontSize: 11, fontWeight: 500, marginBottom: assignment ? 3 : 0 }}>
                                    {getVehicleEmoji(v.make)} {v.make} {v.model}
                                  </div>
                                  
                                  {assignment && (
                                    <div style={{ 
                                      fontSize: 10, 
                                      padding: "4px 8px",
                                      background: assignment.status === "pending" ? COLORS.amberDim : COLORS.purpleDim,
                                      border: `1px solid ${assignment.status === "pending" ? COLORS.amber : COLORS.purple}`,
                                      borderRadius: 4,
                                      marginTop: 4,
                                    }}>
                                      <span style={{ color: assignment.status === "pending" ? COLORS.amber : COLORS.purple, fontWeight: 600 }}>
                                        {assignment.status === "pending" ? "⏳ Pending" : "🚗 Active"}
                                      </span>
                                      <span style={{ color: COLORS.textMuted }}> • </span>
                                      <span style={{ color: COLORS.text }}>
                                        {assignment.driver_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div data-testid="vehicle-list-pagination" style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            paddingTop: 12, 
                            borderTop: `1px solid ${COLORS.border}` 
                          }}>
                            <div data-testid="pagination-info" style={{ fontSize: 10, color: COLORS.textMuted }}>
                              {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length}
                            </div>
                            
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                data-testid="pagination-prev"
                                onClick={() => setVehicleListPage(prev => Math.max(1, prev - 1))}
                                disabled={vehicleListPage === 1}
                                style={{
                                  width: 28, height: 28, borderRadius: 4,
                                  border: `1px solid ${COLORS.border}`,
                                  background: vehicleListPage === 1 ? COLORS.surface : COLORS.surfaceLight,
                                  color: vehicleListPage === 1 ? COLORS.textDim : COLORS.text,
                                  fontSize: 10, fontWeight: 600, cursor: vehicleListPage === 1 ? "not-allowed" : "pointer",
                                  opacity: vehicleListPage === 1 ? 0.5 : 1,
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                ←
                              </button>

                              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                  page = i + 1;
                                } else if (vehicleListPage <= 3) {
                                  page = i + 1;
                                } else if (vehicleListPage >= totalPages - 2) {
                                  page = totalPages - 4 + i;
                                } else {
                                  page = vehicleListPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setVehicleListPage(page)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 4,
                                      border: `1px solid ${vehicleListPage === page ? COLORS.accent : COLORS.border}`,
                                      background: vehicleListPage === page ? COLORS.accentDim : COLORS.surface,
                                      color: vehicleListPage === page ? COLORS.accent : COLORS.text,
                                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center"
                                    }}
                                  >
                                    {page}
                                  </button>
                                );
                              })}

                              <button
                                onClick={() => setVehicleListPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={vehicleListPage === totalPages}
                                style={{
                                  width: 28, height: 28, borderRadius: 4,
                                  border: `1px solid ${COLORS.border}`,
                                  background: vehicleListPage === totalPages ? COLORS.surface : COLORS.surfaceLight,
                                  color: vehicleListPage === totalPages ? COLORS.textDim : COLORS.text,
                                  fontSize: 10, fontWeight: 600, cursor: vehicleListPage === totalPages ? "not-allowed" : "pointer",
                                  opacity: vehicleListPage === totalPages ? 0.5 : 1,
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                →
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </Card>

                {/* Selected Vehicle Details */}
                {selectedVehicle && (
                  <Card style={{ padding: 14, borderColor: getVehicleMapColor(selectedVehicle), animation: "slideUp 0.2s ease", position: "relative" }}>
                    <button onClick={() => setSelectedVehicle(null)} style={{
                      position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%",
                      border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight, color: COLORS.textMuted,
                      fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "all 0.2s", zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.red;
                      e.currentTarget.style.color = COLORS.bg;
                      e.currentTarget.style.borderColor = COLORS.red;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.surfaceLight;
                      e.currentTarget.style.color = COLORS.textMuted;
                      e.currentTarget.style.borderColor = COLORS.border;
                    }}>✕</button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingRight: 32 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedVehicle.make} {selectedVehicle.model}</div>
                        <div style={{ fontSize: 11, color: COLORS.textDim }}>{selectedVehicle.vehicle_code} • {selectedVehicle.year}</div>
                      </div>
                      <StatusBadge status={selectedVehicle.status} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Battery</div>
                        <BatteryBar level={selectedVehicle.current_battery_pct || 0} />
                      </div>
                      <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Range</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedVehicle.range_miles} mi</div>
                      </div>
                      <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Odometer</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedVehicle.odometer?.toLocaleString()} mi</div>
                      </div>
                      <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Temp</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedVehicle.cabin_temp_f}°F</div>
                      </div>
                    </div>

                    {(() => {
                      const assignment = getVehicleAssignment(selectedVehicle.id);
                      if (assignment) {
                        return (
                          <div style={{
                            padding: 10, background: assignment.status === "pending" ? COLORS.amberDim : COLORS.purpleDim, borderRadius: 8,
                            border: `1px solid ${assignment.status === "pending" ? COLORS.amber : COLORS.purple}`,
                          }}>
                            <div style={{ fontSize: 11, color: assignment.status === "pending" ? COLORS.amber : COLORS.purple, fontWeight: 600 }}>
                              {assignment.status === "pending" ? "⏳ Pending Assignment" : "🚗 Active Trip"}
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.text, marginTop: 4 }}>Driver: {assignment.driver_name}</div>
                          </div>
                        );
                      }
                    })()}
                  </Card>
                )}

                {/* Charging Station Details */}
                {selectedStation && (
                  <Card style={{ padding: 14, borderColor: COLORS.accent, animation: "slideUp 0.2s ease", position: "relative" }}>
                    <button onClick={() => setSelectedStation(null)} style={{
                      position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%",
                      border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight, color: COLORS.textMuted,
                      fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "all 0.2s", zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.red;
                      e.currentTarget.style.color = COLORS.bg;
                      e.currentTarget.style.borderColor = COLORS.red;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.surfaceLight;
                      e.currentTarget.style.color = COLORS.textMuted;
                      e.currentTarget.style.borderColor = COLORS.border;
                    }}>✕</button>

                    <div style={{ paddingRight: 32 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>⚡ {selectedStation.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 12 }}>{selectedStation.location}</div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                          <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Available</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{selectedStation.available_ports}/{selectedStation.total_ports}</div>
                        </div>
                        <div style={{ padding: 8, background: COLORS.surfaceLight, borderRadius: 6 }}>
                          <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", marginBottom: 2 }}>Power</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.green }}>{selectedStation.power_kw}kW</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, display: "flex", gap: 4 }}>
                        {Array.from({ length: selectedStation.total_ports }).map((_, i) => (
                          <div key={i} style={{
                            width: 24, height: 32, borderRadius: 4,
                            background: i < selectedStation.total_ports - selectedStation.available_ports ? COLORS.accent : COLORS.border,
                            border: `1px solid ${i < selectedStation.total_ports - selectedStation.available_ports ? COLORS.accent : COLORS.border}`,
                          }} />
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS */}
        {activeTab === "assignments" && (
          <div style={{ animation: "slideUp 0.3s ease" }} data-testid="tab-content-assignments">
            {/* Status Cards - Clickable Filters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} data-testid="status-cards">
              {[
                { label: "Total Fleet", status: "all", icon: "📊", count: counts.total, color: COLORS.accent },
                { label: "Available", status: "available", icon: "✅", count: counts.available, color: COLORS.green },
                { label: "Charging", status: "charging", icon: "⚡", count: counts.charging, color: COLORS.accent },
                { label: "Maintenance", status: "maintenance", icon: "🔧", count: counts.maintenance, color: COLORS.red },
              ].map(item => {
                const isActive = statusFilter === item.status;
                return (
                  <Card key={item.label}
                    data-testid={`status-card-${item.status}`}
                    style={{
                    padding: 12, borderLeft: `3px solid ${item.color}`, cursor: "pointer",
                    background: isActive ? COLORS.surfaceLight : COLORS.surface,
                    border: `1px solid ${isActive ? item.color : COLORS.border}`,
                    transition: "all 0.2s"
                  }}
                  onClick={() => setStatusFilter(isActive ? "all" : item.status)}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      {item.icon} {item.label}
                    </div>
                    <div data-testid={`status-count-${item.status}`} style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.count}</div>
                  </Card>
                );
              })}
            </div>

            <Card style={{ padding: 16 }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Assignment Management</h3>
                  <p style={{ fontSize: 12, color: COLORS.textDim }}>
                    {statusFilter === "all" 
                      ? "Showing all vehicles • One driver per vehicle at a time"
                      : `Filtering: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} vehicles only`
                    }
                  </p>
                </div>
                {statusFilter !== "all" && (
                  <button onClick={() => setStatusFilter("all")} style={{
                    padding: "6px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceLight, color: COLORS.text, fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}>
                    ✕ Clear Filter
                  </button>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table data-testid="assignments-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10, width: 40 }}>#</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Vehicle</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Make/Model</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Battery</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Status</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Assigned Driver</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody data-testid="assignments-table-body">
                    {vehicles
                      .filter(v => statusFilter === "all" || v.status === statusFilter)
                      .sort((a, b) => a.vehicle_code.localeCompare(b.vehicle_code))
                      .map((v, index) => {
                      const assignment = getVehicleAssignment(v.id);
                      
                      return (
                        <tr key={v.id}
                          data-testid={`vehicle-row-${v.vehicle_code}`}
                          style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: getVehicleMapColor(v), boxShadow: `0 0 6px ${getVehicleMapColor(v)}` }} />
                              <span data-testid={`vehicle-code-${v.vehicle_code}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: COLORS.accent }}>
                                {v.vehicle_code}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 500 }}>{getVehicleEmoji(v.make)} {v.make} {v.model}</div>
                            <div style={{ fontSize: 9, color: COLORS.textDim }}>{v.year}</div>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <span data-testid={`battery-${v.vehicle_code}`} style={{ fontWeight: 600, color: v.current_battery_pct > 60 ? COLORS.green : v.current_battery_pct > 30 ? COLORS.amber : COLORS.red }}>
                                {v.current_battery_pct}%
                              </span>
                              <div style={{ width: 40, height: 4, borderRadius: 2, background: COLORS.border, overflow: "hidden" }}>
                                <div style={{ width: `${v.current_battery_pct}%`, height: "100%", background: v.current_battery_pct > 60 ? COLORS.green : v.current_battery_pct > 30 ? COLORS.amber : COLORS.red }} />
                              </div>
                            </div>
                          </td>
                          <td data-testid={`vehicle-status-${v.vehicle_code}`} style={{ padding: "10px 12px", textAlign: "center" }}>
                            <StatusBadge status={v.status} />
                          </td>
                          <td data-testid={`driver-cell-${v.vehicle_code}`} style={{ padding: "10px 12px" }}>
                            {assignment ? (
                              <div>
                                <div data-testid={`assignment-status-${v.vehicle_code}`} style={{
                                  padding: "4px 8px",
                                  background: assignment.status === "pending" ? COLORS.amberDim : COLORS.purpleDim,
                                  border: `1px solid ${assignment.status === "pending" ? COLORS.amber : COLORS.purple}`,
                                  borderRadius: 4, fontSize: 10, display: "inline-block", marginBottom: 4
                                }}>
                                  <div style={{ fontWeight: 600, color: assignment.status === "pending" ? COLORS.amber : COLORS.purple }}>
                                    {assignment.status === "pending" ? "⏳ Pending" : "🚗 Active"}
                                  </div>
                                </div>
                                <div>
                                  <button
                                    data-testid={`driver-contact-btn-${v.vehicle_code}`}
                                    onClick={() => {
                                      const driver = drivers.find(d => d.id === assignment.driver_id);
                                      setShowContactModal(driver);
                                    }}
                                    style={{
                                      background: "none", border: "none",
                                      color: COLORS.accent, fontSize: 11, fontWeight: 500,
                                      cursor: "pointer", textDecoration: "underline", padding: 0,
                                    }}
                                  >
                                    {assignment.driver_name}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: COLORS.textDim, fontSize: 10 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            {assignment ? (
                              assignment.status === "pending" ? (
                                <button
                                  data-testid={`cancel-btn-${v.vehicle_code}`}
                                  onClick={() => handleCancelAssignment(assignment.id)}
                                  style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${COLORS.red}`, background: COLORS.redDim, color: COLORS.red, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                                  Cancel
                                </button>
                              ) : (
                                <span style={{ color: COLORS.textDim, fontSize: 9 }}>Contact driver</span>
                              )
                            ) : v.status === "available" ? (
                              <button
                                data-testid={`assign-btn-${v.vehicle_code}`}
                                onClick={() => { setSelectedVehicle(v); setShowDriverModal(true); }}
                                style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: COLORS.accent, color: COLORS.bg, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                                Assign
                              </button>
                            ) : (
                              <span style={{ color: COLORS.textDim, fontSize: 9 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Driver Selection Modal */}
      {showDriverModal && selectedVehicle && (
        <div data-testid="driver-selection-modal" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}
        onClick={() => setShowDriverModal(false)}>
          
          <Card style={{
            width: "90%", maxWidth: 600, maxHeight: "80vh",
            padding: 24, animation: "slideUp 0.3s ease", overflowY: "auto"
          }}
          onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Select Driver</h2>
                <p style={{ fontSize: 12, color: COLORS.textDim }}>
                  Assign {selectedVehicle.vehicle_code} to an available driver
                </p>
              </div>
              <button data-testid="close-driver-modal" onClick={() => setShowDriverModal(false)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                background: COLORS.surfaceLight, color: COLORS.text, cursor: "pointer",
                fontSize: 16, fontWeight: 600
              }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }} data-testid="driver-list">
              {drivers.filter(d => d.status === "available" && !getDriverAssignment(d.id)).length === 0 ? (
                <div data-testid="no-drivers-message" style={{
                  padding: 40, textAlign: "center",
                  background: COLORS.surfaceLight, borderRadius: 8,
                  border: `1px dashed ${COLORS.border}`
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>😴</div>
                  <div style={{ fontSize: 14, color: COLORS.textMuted }}>No available drivers</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
                    All drivers are currently assigned or off duty
                  </div>
                </div>
              ) : (
                drivers
                  .filter(d => d.status === "available" && !getDriverAssignment(d.id))
                  .map((d) => (
                    <Card key={d.id}
                      data-testid={`driver-card-${d.id}`}
                      style={{
                      padding: 14, cursor: "pointer", border: `1px solid ${COLORS.border}`,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.accent}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.border}
                    onClick={() => {
                      if (window.confirm(`Assign ${selectedVehicle.vehicle_code} to ${d.name}?`)) {
                        handleAssign(selectedVehicle.id, d.id);
                      }
                    }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>👤 {d.name}</div>
                        <StatusBadge status={d.status} />
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>
                        📧 {d.email}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.textDim }}>
                        📞 {d.phone} • 🪪 {d.license_number}
                      </div>
                      <button
                        data-testid={`assign-driver-btn-${d.id}`}
                        style={{
                        marginTop: 10, width: "100%", padding: "8px", borderRadius: 6,
                        border: "none", background: COLORS.accent, color: COLORS.bg,
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>
                        ✓ Assign {selectedVehicle.vehicle_code}
                      </button>
                    </Card>
                  ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Driver Contact Modal */}
      {showContactModal && (
        <div data-testid="contact-modal" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}
        onClick={() => setShowContactModal(null)}>
          
          <Card style={{
            width: "90%", maxWidth: 400,
            padding: 24, animation: "slideUp 0.3s ease"
          }}
          onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Driver Contact</h2>
              <button data-testid="close-contact-modal" onClick={() => setShowContactModal(null)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                background: COLORS.surfaceLight, color: COLORS.text, cursor: "pointer",
                fontSize: 16, fontWeight: 600
              }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 12, background: COLORS.surfaceLight, borderRadius: 8 }}>
              <div style={{ fontSize: 32 }}>👤</div>
              <div>
                <div data-testid="contact-modal-name" style={{ fontSize: 16, fontWeight: 600 }}>{showContactModal.name}</div>
                <StatusBadge status={showContactModal.status} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: COLORS.surface, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 16 }}>📧</span>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase" }}>Email</div>
                  <div data-testid="contact-modal-email" style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>{showContactModal.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: COLORS.surface, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 16 }}>📞</span>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase" }}>Phone</div>
                  <div data-testid="contact-modal-phone" style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>{showContactModal.phone}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: COLORS.surface, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 16 }}>🪪</span>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase" }}>License</div>
                  <div data-testid="contact-modal-license" style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>{showContactModal.license_number}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: COLORS.amberDim, border: `1px solid ${COLORS.amber}`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: COLORS.amber, fontWeight: 600 }}>
                ℹ️ Active Assignment
              </div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
                Driver must complete or cancel the current trip before reassignment.
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
