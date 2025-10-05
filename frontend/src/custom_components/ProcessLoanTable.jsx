// ProcessLoanTable.jsx
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
import { useState, useMemo } from "react";
import { useUpload } from "../context/UploadContext";
import api from "../api/client";

const ProcessLoanTable = ({
  columns = [],
  data = [],
  setShowSection = () => {},
  loading,
  onRefresh = () => {},
  onAddLoanPackage = () => {},
  handleViewChange = () => {},
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const {
    set_normalized_json,
    analyzedState,
    setAnalyzedState,
    setReport,
    set_filter_borrower,
    setHasModifications,
  } = useUpload(); // make sure you import from UploadContext

  const handleView = async (row) => {
    try {
      setReport({});
      set_filter_borrower("");
      const response = await api.post("/view-loan", {
        email: sessionStorage.getItem("email") || "",
        loanId: row.loanId,
      });

      const data = response.data;
      if (!Object.keys(data).length) {
        console.log("Data is empty!");
        return;
      }

      console.log("check data", data);
      sessionStorage.setItem("loanId", row.loanId || "");

      set_normalized_json(data.cleaned_data);
      setAnalyzedState((prev) => ({
        ...prev,
        isAnalyzed: data.analyzed_data,
      }));
      // ✅ Capture hasModifications from backend
      setHasModifications(!!data.hasModifications);
      handleViewChange();
      console.log("view data, ", data);
    } catch (error) {
      console.error("Error fetching loan data:", error);
    }
  };

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

  // Add stable sno + original index so S.No sorting has something to compare
  const dataWithIndex = useMemo(
    () =>
      (data || []).map((r, i) => {
        return {
          ...r,
          _originalIndex: i,
          sno: i + 1, // stable serial number based on original dataset order
        };
      }),
    [data]
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // cycle asc -> desc -> none
        const nextDir =
          prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? null
            : "asc";
        return { key: nextDir ? key : null, direction: nextDir };
      }
      return { key, direction: "asc" };
    });
  };

  // helper to get comparable value for sorting
  const getComparableValue = (row, key) => {
    if (!key) return "";
    if (key === "sno") return Number(row.sno ?? row._originalIndex ?? 0);

    const v = row[key];
    if (Array.isArray(v)) return v.join(" ").toLowerCase();
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v.toLowerCase();
    return v;
  };

  // build filtered + sorted data
  const processedData = useMemo(() => {
    let filtered = dataWithIndex.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;

      if (search && search.trim()) {
        const q = search.toLowerCase();
        const loanIdMatch = (row.loanId || "")
          .toString()
          .toLowerCase()
          .includes(q);
        const fileNameMatch = (row.fileName || "")
          .toString()
          .toLowerCase()
          .includes(q);
        const borrowerMatch =
          Array.isArray(row.borrower) &&
          row.borrower.some((b) => (b || "").toLowerCase().includes(q));
        const uploadedByMatch = (row.uploadedBy || "")
          .toString()
          .toLowerCase()
          .includes(q);
        return loanIdMatch || fileNameMatch || borrowerMatch || uploadedByMatch;
      }

      return true;
    });

    if (sortConfig && sortConfig.key && sortConfig.direction) {
      const key = sortConfig.key;
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      filtered = [...filtered].sort((a, b) => {
        const av = getComparableValue(a, key);
        const bv = getComparableValue(b, key);

        // numbers compare
        if (typeof av === "number" && typeof bv === "number") {
          return (av - bv) * dir;
        }

        // fallback to localeCompare for strings (numeric option helps 'LDNA-2' vs 'LDNA-10')
        return (
          String(av).localeCompare(String(bv), undefined, { numeric: true }) *
          dir
        );
      });
    }

    return filtered;
  }, [dataWithIndex, search, statusFilter, sortConfig]);

  // merge SNo column at front of columns list
  const tableColumns = useMemo(() => {
    // ensure we insert S.No as first column
    const hasSno = columns.some((c) => c.id === "sno");
    if (hasSno) return columns;
    return [{ id: "sno", label: "S.No", isCustom: true }, ...columns];
  }, [columns]);

  return (
    <div className="p-2 bg-white rounded-lg min-h-[400px]">
      <div className="flex items-center justify-between my-4">
        <span className="font-bold text-lg">Processed Loans</span>

        <div className="flex gap-3 items-center">
          {searchOpen ? (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search loans..."
              value={search}
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => {
                if (!search) setSearchOpen(false);
              }}
              sx={{ minWidth: 260 }}
            />
          ) : (
            <Tooltip title="Search">
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Refresh">
            <IconButton
              onClick={() => {
                onRefresh();
              }}
            >
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
          </Select>

          <Button
            label="Add Loan Package +"
            variant="add-loan"
            onClick={onAddLoanPackage}
            width={200}
          />
        </div>
      </div>

      {/* <div className="flex items-center justify-end my-4 gap-3"></div> */}

      <CustomTable
        columns={tableColumns}
        data={processedData}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        renderCustomCells={(field, row, rowIndex) => {
          if (field === "sno") {
            // use stable sno on row (not page index)
            return row.sno ?? row._originalIndex + 1;
          }

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
                        title={b}
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
                        ? "show less"
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
                <button
                  className="hover:underline"
                  onClick={() => handleView(row)}
                >
                  View
                </button>
                <span className="px-2 text-gray-600">|</span>
                <button className="hover:underline">Download</button>
              </div>
            );
          }

          // default fallback - display raw value
          return row[field] ?? "-";
        }}
      />
    </div>
  );
};

export default ProcessLoanTable;
