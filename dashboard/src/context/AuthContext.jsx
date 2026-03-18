import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Mock users - in production this would be your API
const MOCK_USERS = [
  { id: 1, email: "manager@fleetpulse.com", password: "manager123", role: "manager", name: "Fleet Manager" },
  { id: 2, email: "viewer@fleetpulse.com", password: "viewer123", role: "viewer", name: "Fleet Viewer" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("fleetpulse_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem("fleetpulse_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call delay
    await new Promise((res) => setTimeout(res, 800));

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      throw new Error("Invalid email or password");
    }

    const userData = { id: found.id, email: found.email, role: found.role, name: found.name };
    setUser(userData);
    sessionStorage.setItem("fleetpulse_user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("fleetpulse_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
