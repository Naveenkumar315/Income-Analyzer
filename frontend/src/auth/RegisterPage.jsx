import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../api/client";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState({ isError: false, errorMessage: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !userInfo.username ||
      !userInfo.email ||
      !userInfo.password ||
      !userInfo.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (userInfo.password !== userInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // 🔹 Normalize data before sending to DB
    const formattedUser = {
      ...userInfo,
      username:
        userInfo.username.charAt(0).toUpperCase() +
        userInfo.username.slice(1).toLowerCase(),
      email: userInfo.email.toLowerCase(),
    };

    try {
      setLoading(true);
      const res = await api.post("/auth/register", formattedUser);

      toast.success("Registration successful!");
      setUserInfo({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response && err.response.data && err.response.data.detail) {
        toast.error(`${err.response.data.detail}`);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/auth_page_bg.png')" }} // change filename
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/loandna_logo.svg" alt="Logo" className="h-10" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">Register</h2>

        {/* {
          error.isError &&
            // <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm text-center">
            alert(error.errorMessage)
          // </div>
        } */}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="username"
            name="username"
            label="Username"
            placeholder="Enter your username"
            value={userInfo.username}
            onChange={handleChange}
            required
          />

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
            placeholder="Create a password"
            value={userInfo.password}
            onChange={handleChange}
            required
            showPasswordToggle
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={userInfo.confirmPassword}
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
                "Register →"
              )}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/" className="text-sky-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
