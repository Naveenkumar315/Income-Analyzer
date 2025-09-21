import Button from "../components/Button";
import CustomTable from "./CustomTable";
import {
  Chip,
  Avatar,
  TextField,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useState, useMemo } from "react";

const ProcessLoanTable = ({
  columns = [],
  data = [],
  setShowSection = () => {},
  loading,
  onRefresh = () => {}, // 🔹 pass refresh from Dashboard
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handle_section_change = () => {
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: true,
      extractedSection: false,
    }));
  };

  // 🔹 Sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // toggle direction
        return {
          key,
          direction:
            prev.direction === "asc"
              ? "desc"
              : prev.direction === "desc"
              ? null
              : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Derived filtered & sorted data
  const processedData = useMemo(() => {
    let filtered = data.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;

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

    if (sortConfig.key && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, statusFilter, sortConfig]);

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

      {/* Status Filter */}
      <div className="flex items-center justify-end my-4">
        <div className="flex gap-3 items-center">
          {/* Search */}
          {searchOpen ? (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search loans..."
              value={search}
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setSearchOpen(false)}
            />
          ) : (
            <Tooltip title="Search">
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Refresh */}
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
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
      </div>

      {/* Table */}
      <CustomTable
        columns={[
          { id: "sno", label: "S.No", isCustom: true }, // 🔹 new column
          ...columns,
        ]}
        data={processedData}
        loading={loading}
        renderCustomCells={(field, row, rowIndex) => {
          if (field === "sno") return rowIndex + 1;

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
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
};

export default ProcessLoanTable;
