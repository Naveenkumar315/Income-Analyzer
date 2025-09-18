import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { LoaderProvider } from "./context/LoaderContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <LoaderProvider>
    <App />
  </LoaderProvider>
);
