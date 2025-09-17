import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../api/client";

const RegisterPage = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({ isError: false, errorMessage: "" });

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
      setError({ isError: true, errorMessage: "All fields are required" });
      return;
    }

    if (userInfo.password !== userInfo.confirmPassword) {
      setError({ isError: true, errorMessage: "Passwords do not match" });
      return;
    }

    try {
      const res = await api.post("/auth/register", userInfo);

      // Success 🎉
      setError({ isError: false, errorMessage: "" });
      alert("Registration successful! 🎉");
      console.log("Submitting register form:", res.data);

      // Optionally clear form
      setUserInfo({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Registration error:", err);

      // If backend sends error in response
      if (err.response && err.response.data && err.response.data.detail) {
        alert(`Error: ${err.response.data.detail}`);
        setError({ isError: true, errorMessage: err.response.data.detail });
      } else {
        alert("Something went wrong. Please try again.");
        setError({ isError: true, errorMessage: "Unexpected error" });
      }
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

        {
          error.isError &&
            // <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm text-center">
            alert(error.errorMessage)
          // </div>
        }

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

          <Button
            type="submit"
            className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition"
            label="Register →"
          />
        </form>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-sky-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
