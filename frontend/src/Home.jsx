import { useState, useEffect } from "react";
import Dashboard from "./custom_components/Dashboard";
import Header from "./custom_components/Header";
import Rules from "./custom_components/Rules";
import useCurrentUser from "./hooks/useCurrentUser";
import IncomeAnalyzer from "./pages/IncomeAnalyer";
import { useUpload } from "./context/UploadContext";

const Home = () => {
  const { user, logout } = useCurrentUser();
  const { username, email } = user || {};
  const name = username || "User";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const [tab, setTab] = useState(0);
  const [incomeTabVisible, setIncomeTabVisible] = useState(false);

  const { setShowSection } = useUpload();

  const handleAddLoanPackage = () => {
    setIncomeTabVisible(true); // show the tab
    setTab(1); // jump to Income Analyzer
  };

  // Reset sections when switching tabs
  useEffect(() => {
    if (tab === 0) {
      // Reset Dashboard state
      setShowSection({
        processLoanSection: true,
        provideLoanIDSection: false,
        extractedSection: false,
        uploadedModel: false,
        startAnalyzing: false,
      });
    }
    if (tab === 1) {
      // Reset Income Analyzer state
      setShowSection({
        processLoanSection: false,
        provideLoanIDSection: true,
        extractedSection: false,
        uploadedModel: false,
        startAnalyzing: false,
      });
    }
  }, [tab, setShowSection]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        initial={initial}
        tabValue={tab}
        onTabChange={(e, v) => setTab(v)}
        logout={logout}
        username={username || sessionStorage.getItem("username")}
        email={email || sessionStorage.getItem("email")}
        incomeTabVisible={incomeTabVisible}
      />

      <main className="flex-1 overflow-hidden bg-gray-100">
        <div className="h-full overflow-auto p-4">
          {tab === 0 && (
            <Dashboard
              username={username}
              email={email}
              onAddLoanPackage={handleAddLoanPackage}
            />
          )}
          {incomeTabVisible && tab === 1 && <IncomeAnalyzer />}
          {tab === 2 && <Rules />}
        </div>
      </main>
    </div>
  );
};

export default Home;
