import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // navigation
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../api/client"; // axios instance
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // const [error, setError] = useState({ isError: false, errorMessage: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo.email || !userInfo.password) {
      toast.error("Email and password are required");
      return;
    }

    // 🔹 Normalize email before sending
    const formattedUser = {
      ...userInfo,
      email: userInfo.email.toLowerCase(),
    };

    try {
      setLoading(true);

      const res = await api.post("/auth/login", formattedUser);

      // Backend returns { access_token, token_type }
      const { access_token } = res.data;

      // Save token in localStorage (or cookies if you want more security)
      localStorage.setItem("token", access_token);

      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);

      if (err.response && err.response.data && err.response.data.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Login →"
              )}
            </button>
          </div>
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
