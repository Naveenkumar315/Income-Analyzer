import Switch from '@mui/material/Switch';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const label = { inputProps: { 'aria-label': 'Switch demo' } };

const Header = ({ initial = "N", tabValue, onTabChange }) => {

    return (
        <header className="h-16 bg-white flex items-center px-6 shadow-md">
            {/* Left Section (Logo) */}
            <div className="flex-1">
                <img src="/loandna_logo.png" alt="Logo" className="h-10 w-[50px" />
            </div>

            {/* Center Section (Tabs) */}
            <div className="flex-1 flex justify-center">
                <Box sx={{ width: '100%' }}>
                    <Tabs
                        value={tabValue}
                        onChange={onTabChange}
                        aria-label="header tabs"
                        sx={{
                            minHeight: '64px',          // match header height
                            alignItems: 'flex-end',     // push indicator to bottom
                        }}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: "#26a3dd",
                                height: 3,
                                bottom: 0,               // flush to bottom
                            }
                        }}
                        textColor="inherit"
                    >
                        {["Dashboard", "View Rules", "Settings"].map((label, index) => (
                            <Tab
                                key={index}
                                label={label}
                                disableRipple
                                sx={{
                                    minHeight: '64px',
                                    fontWeight: tabValue === index ? 'bold' : 'normal',      // bold active
                                    color: tabValue === index ? '#26a3dd' : '#6B7280',      // blue vs gray
                                    '&:hover': { backgroundColor: 'transparent' },          // remove hover
                                    textTransform: 'none',                                  // no uppercase
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

            </div>

            {/* Right Section (Actions + Avatar) */}
            <div className="flex-1 flex justify-end items-center gap-4">
                <Switch {...label} defaultChecked />
                <button className="text-gray-600 hover:text-blue-600">
                    <SearchIcon />
                </button>
                <button className="text-[#12699D]">
                    <NotificationsIcon />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#12699D] flex items-center cursor-pointer justify-center text-white font-bold text-md shadow-md">
                    {initial}
                </div>
            </div>
        </header>
    );
}

export default Header;
