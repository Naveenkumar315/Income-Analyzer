import { useState } from "react";
import Dashboard from "./custom_components/Dashboard";
import Header from "./custom_components/Header";
import Rules from "./custom_components/Rules";

const Home = () => {
    const [tab, setTab] = useState(0);
    const name = "Naveen";
    const initial = name ? name.charAt(0).toUpperCase() : "?";
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header initial={initial} tabValue={tab} onTabChange={handleTabChange} />

            {/* Main Content - takes remaining height */}
            <main className="flex-1 bg-gray-100 p-4 overflow-auto">
                <div className="min-h-[400px] max-h-[calc(100vh-80px)] overflow-auto"
                >
                    {tab === 0 && <Dashboard />}
                    {tab === 1 && <Rules />}
                </div>
            </main>
        </div>
    );
};

export default Home;
