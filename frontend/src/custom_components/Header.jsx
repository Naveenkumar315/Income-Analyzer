import { useState, useRef, useEffect } from "react";
import Switch from "@mui/material/Switch";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const label = { inputProps: { "aria-label": "Switch demo" } };

const Header = ({
  initial = "N",
  tabValue,
  onTabChange,
  logout = () => {},
  username = "User",
  email = "",
  incomeTabVisible = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build tab list conditionally
  const tabs = ["Dashboard"];
  if (incomeTabVisible) tabs.push("Income Analyzer");
  tabs.push("View Rules");
  tabs.push("Settings");

  return (
    <header className="h-16 bg-white flex items-center px-6 shadow-md relative">
      {/* Left Section (Logo) */}
      <div className="flex-1">
        <img src="/loandna_logo.png" alt="Logo" className="h-10 w-[50px]" />
      </div>

      {/* Center Section (Tabs) */}
      <div className="flex-1 flex justify-center">
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={tabValue}
            onChange={onTabChange}
            aria-label="header tabs"
            sx={{
              minHeight: "64px",
              alignItems: "flex-end",
            }}
            TabIndicatorProps={{
              style: {
                backgroundColor: "#26a3dd",
                height: 3,
                bottom: 0,
              },
            }}
            textColor="inherit"
          >
            {tabs.map((label, index) => (
              <Tab
                key={index}
                label={label}
                disableRipple
                sx={{
                  minHeight: "64px",
                  fontWeight: tabValue === index ? "bold" : "normal",
                  color: tabValue === index ? "#26a3dd" : "#6B7280",
                  "&:hover": { backgroundColor: "transparent" },
                  textTransform: "none",
                }}
              />
            ))}
          </Tabs>
        </Box>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-end items-center gap-4">
        <Switch {...label} defaultChecked />
        <button className="text-gray-600 hover:text-blue-600">
          <SearchIcon />
        </button>
        <button className="text-[#12699D]">
          <NotificationsIcon />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#26a3dd] to-[#12699D] flex items-center cursor-pointer justify-center text-white font-bold text-md shadow-md"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {initial}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg border z-1000 p-4">
              {/* Profile section */}
              <div className="flex items-center space-x-3 pb-4 border-b">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#12699D] text-white font-bold text-lg">
                  {username ? username[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-base">
                    {username || "Unknown User"}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {email || "No email"}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <div className="pt-4">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
