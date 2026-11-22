
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("adminToken")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/admin-auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAdmin(response.data.data);
      } catch (error) {
        localStorage.removeItem("adminToken");
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/admin-auth/login", {
      email,
      password,
    });

    const { token: newToken, data } = response.data;

    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
    setAdmin(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: Boolean(admin && token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
