import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import api from "../api/client"; // axios instance with token interceptor
// import { useNavigate } from "react-router-dom"; // navigation
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch current user from backend
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  useLayoutEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
