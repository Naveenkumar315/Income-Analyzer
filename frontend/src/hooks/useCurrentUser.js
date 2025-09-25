import { useEffect, useState } from "react";
import api from "../api/client";
import "../styles/custom-loader.css"; // adjust path as needed

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
    const loader = document.getElementById("custom-loader");
    if (loader) loader.style.display = "flex"; // show loader

    sessionStorage.clear();
    setUser(null);

    // simulate small delay before redirect to show loader
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return { user, loading, logout };
}
