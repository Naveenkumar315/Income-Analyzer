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

  const {
    setShowSection,
    saveIncomeAnalyzerState,
    restoreIncomeAnalyzerState,
    resetIncomeAnalyzerState,
    incomeAnalyzerInitialized,
  } = useUpload();

  const handleAddLoanPackage = () => {
    // Set initial state for Income Analyzer
    setShowSection({
      processLoanSection: false,
      provideLoanIDSection: true,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: false,
    });

    setIncomeTabVisible(true); // show the tab
    setTab(1); // jump to Income Analyzer
  };

  // Handle tab switching with state preservation
  const handleTabChange = (e, newTab) => {
    // Save current state when leaving Income Analyzer tab
    if (tab === 1) {
      saveIncomeAnalyzerState();
    }

    // Reset Dashboard state when switching to Dashboard
    if (newTab === 0) {
      setShowSection({
        processLoanSection: true,
        provideLoanIDSection: false,
        extractedSection: false,
        uploadedModel: false,
        startAnalyzing: false,
      });
    }

    // Handle Income Analyzer tab
    if (newTab === 1) {
      if (incomeAnalyzerInitialized) {
        // Restore previous state if user has been here before
        restoreIncomeAnalyzerState();
      } else {
        // First time accessing Income Analyzer - start fresh
        setShowSection({
          processLoanSection: false,
          provideLoanIDSection: true,
          extractedSection: false,
          uploadedModel: false,
          startAnalyzing: false,
        });
      }
    }

    setTab(newTab);
  };

  // Initialize Dashboard state on first load
  useEffect(() => {
    setShowSection({
      processLoanSection: true,
      provideLoanIDSection: false,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: false,
    });
  }, []); // Only run once on mount

  return (
    <div className="flex flex-col h-screen">
      <Header
        initial={initial}
        tabValue={tab}
        onTabChange={handleTabChange}
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
