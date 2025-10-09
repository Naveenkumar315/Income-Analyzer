import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "./utils/ToastProvider";

import ProtectedRoute from "./context/ProtectedRoute";
import HomePage from "./Home";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastProvider />
    </BrowserRouter>
  );
};

export default App;
