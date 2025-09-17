import Button from "../components/Button";
import CustomTable from "./CustomTable";
import { Chip, Avatar } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LoanExatraction from "./LoanExtraction";

const Dashboard = () => {

  // columns.js
  const columns = [
    { id: "loanId", label: "Loan ID" },
    { id: "fileName", label: "File Name" },
    { id: "borrower", label: "Borrower Name" },
    { id: "loanType", label: "Loan Type" },
    { id: "status", label: "Status", isCustom: true },
    { id: "lastUpdated", label: "Last Updated" },
    { id: "uploadedBy", label: "Uploaded By" },
    { id: "actions", label: "Actions", isCustom: true },
  ];


  const data = [
    {
      loanId: "LN-20250915-001",
      fileName: "123456789_W2.json",
      borrower: "John Doe",
      loanType: "Conventional",
      status: "Completed",
      lastUpdated: "2025-09-14 10:45 AM",
      uploadedBy: "John Doe",
      actions: ""
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Pending",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: ""
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Error",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: ""
    },
    {
      loanId: "LN-20250915-001",
      fileName: "123456789_W2.json",
      borrower: "John Doe",
      loanType: "Conventional",
      status: "Completed",
      lastUpdated: "2025-09-14 10:45 AM",
      uploadedBy: "John Doe",
      actions: ""
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Pending",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: ""
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Error",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: ""
    }
  ];


  return (
    <>
      {/* <div className="p-2 bg-white rounded-lg p-2 min-h-[400px]" style={{
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)"
      }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Processed Loans</span>

          <Button label="Add Loan Package +" variant="add-loan" />

        </div>
        <div className="border-t border-gray-300 my-6"></div>
        <CustomTable
          columns={columns}
          data={data}
          renderCustomCells={(field, row) => {
            if (field === "status") {
              let chipProps = {};

              if (row.status === "Completed") {
                chipProps = {
                  avatar: (
                    <Avatar sx={{ bgcolor: "green" }}>
                      <CheckIcon fontSize="small" sx={{ color: "white" }} />
                    </Avatar>
                  ),
                  label: "Completed",
                  sx: {
                    backgroundColor: "#C8E6C9", // light green
                    color: "green",
                    fontWeight: "bold"
                  }
                };
              } else if (row.status === "Pending") {
                chipProps = {
                  avatar: (
                    <Avatar sx={{ bgcolor: "goldenrod" }}>
                      <MoreHorizIcon fontSize="small" sx={{ color: "white" }} />
                    </Avatar>
                  ),
                  label: "Pending",
                  sx: {
                    backgroundColor: "#FFF9C4", // light yellow
                    color: "goldenrod",
                    fontWeight: "bold"
                  }
                };
              } else {
                chipProps = {
                  avatar: (
                    <Avatar sx={{ bgcolor: "red" }}>
                      <ErrorOutlineOutlinedIcon fontSize="small" sx={{ bgcolor: "red", color: "white" }} />
                    </Avatar>
                  ),
                  label: "Error",
                  sx: {
                    backgroundColor: "#FFCDD2", // light red
                    color: "red",
                    fontWeight: "bold"
                  }
                };
              }

              return <Chip {...chipProps} />;
            }
            if (field === "actions") {
              return (
                <div className="flex items-center space-x-2">
                  <button className="hover:underline">View</button>
                  <span className="px-2 text-gray-600">|</span>
                  <button className="hover:underline">Download</button>
                </div>

              );
            }
            return null;
          }}
        />
      </div> */}
      <div>
        <div className="bg-white rounded-lg p-2 min-h-[400px] max-h-[calc(100vh-80px)] shadow-lg">
          <LoanExatraction />
        </div>
      </div>

    </>
  );
};

export default Dashboard;
