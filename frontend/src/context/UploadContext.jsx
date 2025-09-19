import { createContext, useContext, useEffect, useState } from "react";

// Create context
const UploadContext = createContext();

// Provider component
export const UploadProvider = ({ children }) => {
  const [isUploaded, setIsUploaded] = useState({ uploaded: false });
  const [normalized_json, set_normalized_json] = useState(null);
  useEffect(() => {
    console.log("++++++", normalized_json);
  }, [normalized_json]);
  return (
    <UploadContext.Provider
      value={{
        isUploaded,
        setIsUploaded,
        normalized_json,
        set_normalized_json,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

// Custom hook (nice shortcut)
export const useUpload = () => useContext(UploadContext);
