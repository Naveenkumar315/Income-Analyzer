import { useState } from "react";
import Dashboard from "./custom_components/Dashboard";
import Header from "./custom_components/Header";
import Rules from "./custom_components/Rules";
import useCurrentUser from "./hooks/useCurrentUser";

const Home = () => {
  const { user, logout } = useCurrentUser();
  const { username, email } = user || {};
  const name = username || "User";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const [tab, setTab] = useState(0);

  return (
    <div className="flex flex-col h-screen">
      {/* Header (fixed height) */}
      <Header
        initial={initial}
        tabValue={tab}
        onTabChange={(e, v) => setTab(v)}
        logout={logout}
        username={username}
        email={email}
      />

      {/* Main Content fills rest of viewport */}
      <main className="flex-1 overflow-hidden bg-gray-100">
        <div className="h-full overflow-auto p-4">
          {tab === 0 && <Dashboard username={username} email={email} />}
          {tab === 1 && <Rules />}
        </div>
      </main>
    </div>
  );
};

export default Home;
