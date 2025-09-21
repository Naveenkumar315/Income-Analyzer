import Button from "../components/Button";
import CustomTable from "./CustomTable";
import { Chip, Avatar } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

const ProcessLoanTable = ({
  columns = [],
  data = [],
  setShowSection = () => {},
  loading,
}) => {
  const handle_section_change = () => {
    try {
      setShowSection((prev) => ({
        ...prev,
        processLoanSection: false,
        provideLoanIDSection: true,
        extractedSection: false,
      }));
    } catch (Ex) {
      console.error("error in handle_section_change fn", Ex);
    }
  };
  return (
    <div className="p-2 bg-white rounded-lg min-h-[400px]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">Processed Loans</span>

        <Button
          label="Add Loan Package +"
          variant="add-loan"
          onClick={() => handle_section_change()}
          width={200}
        />
      </div>
      <div className="border-t border-gray-300 my-6"></div>
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
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
                  fontWeight: "bold",
                },
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
                  fontWeight: "bold",
                },
              };
            } else {
              chipProps = {
                avatar: (
                  <Avatar sx={{ bgcolor: "red" }}>
                    <ErrorOutlineOutlinedIcon
                      fontSize="small"
                      sx={{ bgcolor: "red", color: "white" }}
                    />
                  </Avatar>
                ),
                label: "Error",
                sx: {
                  backgroundColor: "#FFCDD2", // light red
                  color: "red",
                  fontWeight: "bold",
                },
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

          if (field === "borrower") {
            if (Array.isArray(row.borrower)) {
              return (
                <select className="border rounded px-2 py-1">
                  {row.borrower.map((b, idx) => (
                    <option key={idx} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              );
            }
            return row.borrower || "-";
          }

          return null;
        }}
      />
    </div>
  );
};

export default ProcessLoanTable;
