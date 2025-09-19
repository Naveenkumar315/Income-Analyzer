import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { LoaderProvider } from "./context/LoaderContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <UploadProvider>
    <LoaderProvider>
      <App />
    </LoaderProvider>
  </UploadProvider>
);
