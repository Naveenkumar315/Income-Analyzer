import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Button from "../components/Button";

const ResultTab = ({ Tabs, value, handleGetResult }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <TabContext value={value}>
        <Box
          sx={{
            display: "inline-flex",
            bgcolor: "#e0e0e0", // gray background for container
            borderRadius: "10px", // pill container
            p: "4px", // inner padding to create gap around tabs
          }}
        >
          <TabList
            onChange={handleGetResult}
            aria-label="tabs example"
            sx={{
              "& .MuiTabs-indicator": {
                display: "none", // remove bottom border
              },
              minHeight: "unset",
            }}
          >
            {Tabs.map((tab) => (
              <Tab
                key={tab}
                label={`${tab}`}
                value={tab}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "8px",
                  px: 3,
                  py: 1,
                  minHeight: "30px",
                  minWidth: "120px",

                  bgcolor: value === tab ? "#26a3dd" : "transparent",
                  color: value === tab ? "#fff" : "#000",

                  "&.Mui-selected": {
                    bgcolor: "#26a3dd",
                    color: "#fff",
                  },
                }}
              />
            ))}
          </TabList>
        </Box>

        <TabPanel value="1">
          <Button />
        </TabPanel>
        <TabPanel value="2">Content for Tab 2</TabPanel>
        <TabPanel value="3">Content for Tab 3</TabPanel>
      </TabContext>
    </Box>
  );
};

export default ResultTab;
