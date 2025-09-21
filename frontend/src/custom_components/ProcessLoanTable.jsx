import Button from "../components/Button";
import CustomTable from "./CustomTable";
import { Chip, Avatar, TextField, MenuItem, Select } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useState, useMemo } from "react";

const ProcessLoanTable = ({
  columns = [],
  data = [],
  setShowSection = () => {},
  loading,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  // 🔹 Derived filtered data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // status filter
      if (statusFilter !== "All" && row.status !== statusFilter) return false;

      // search filter
      if (search) {
        const q = search.toLowerCase();
        return (
          row.loanId.toLowerCase().includes(q) ||
          row.fileName.toLowerCase().includes(q) ||
          (Array.isArray(row.borrower) &&
            row.borrower.some((b) => b.toLowerCase().includes(q))) ||
          row.uploadedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, search, statusFilter]);

  return (
    <div className="p-2 bg-white rounded-lg min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">Processed Loans</span>
        <Button
          label="Add Loan Package +"
          variant="add-loan"
          onClick={() => handle_section_change()}
          width={200}
        />
      </div>

      {/* 🔹 Search & Filter Controls */}
      <div className="flex items-center justify-between my-4 gap-4">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search loans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
        >
          <MenuItem value="All">All Status</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Error">Error</MenuItem>
        </Select>
      </div>

      <div className="border-t border-gray-300 mb-4"></div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={filteredData}
        loading={loading}
        renderCustomCells={(field, row, rowIndex) => {
          if (field === "borrower") {
            if (Array.isArray(row.borrower) && row.borrower.length > 0) {
              const maxVisible = 2;
              const isExpanded = expandedRow === rowIndex;

              return (
                <div className="flex flex-wrap gap-1 items-center">
                  {row.borrower
                    .slice(0, isExpanded ? row.borrower.length : maxVisible)
                    .map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {b}
                      </span>
                    ))}

                  {row.borrower.length > maxVisible && (
                    <button
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : rowIndex)
                      }
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {isExpanded
                        ? " -less"
                        : `+${row.borrower.length - maxVisible} more`}
                    </button>
                  )}
                </div>
              );
            }
            return "-";
          }

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
                  backgroundColor: "#C8E6C9",
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
                  backgroundColor: "#FFF9C4",
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
                  backgroundColor: "#FFCDD2",
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

          return null;
        }}
      />
    </div>
  );
};

export default ProcessLoanTable;
