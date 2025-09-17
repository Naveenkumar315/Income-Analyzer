import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // navigation
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../api/client"; // axios instance

export default function LoginPage() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({ isError: false, errorMessage: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo.email || !userInfo.password) {
      setError({
        isError: true,
        errorMessage: "Email and password are required",
      });
      return;
    }

    try {
      debugger;
      const res = await api.post("/auth/login", userInfo);

      // Backend returns { access_token, token_type }
      const { access_token } = res.data;

      // Save token in localStorage (or cookies if you want more security)
      localStorage.setItem("token", access_token);

      setError({ isError: false, errorMessage: "" });

      alert("Login successful ✅");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);

      if (err.response && err.response.data && err.response.data.detail) {
        setError({ isError: true, errorMessage: err.response.data.detail });
        alert(`Error: ${err.response.data.detail}`);
      } else {
        setError({ isError: true, errorMessage: "Unexpected error" });
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/auth_page_bg.png')" }}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/loandna_logo.svg" alt="Logo" className="h-10" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">Login</h2>

        {/* {error.isError && alert(error.errorMessage)} */}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={userInfo.email}
            onChange={handleChange}
            required
          />

          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={userInfo.password}
            onChange={handleChange}
            required
            showPasswordToggle
          />

          <Button
            type="submit"
            className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition"
            label="Login →"
          />
        </form>

        <p className="text-sm text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/register" className="text-sky-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
