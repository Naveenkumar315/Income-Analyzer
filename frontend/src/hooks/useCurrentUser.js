import { useEffect, useState } from "react";
import api from "../api/client";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        const { username, email } = res.data;
        sessionStorage.setItem("user", JSON.stringify({ username, email }));
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, logout };
}
