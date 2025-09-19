import { createContext, useContext, useState } from "react";

// Create context
const UploadContext = createContext();

// Provider component
export const UploadProvider = ({ children }) => {
  const [isUploaded, setIsUploaded] = useState({ uploaded: false });

  return (
    <UploadContext.Provider value={{ isUploaded, setIsUploaded }}>
      {children}
    </UploadContext.Provider>
  );
};

// Custom hook (nice shortcut)
export const useUpload = () => useContext(UploadContext);
