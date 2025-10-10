import React, { useState, useMemo, useCallback } from "react";
import Button from "../../components/Button";
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
import { useUpload } from "../../context/UploadContext";
import api from "../../api/client";

const ProcessLoanTable = ({
  data = [],
  loading,
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
    setAnalyzedState,
    setReport,
    set_filter_borrower,
    setHasModifications,
    setBorrowerList,
    setIsSAClicked,
    setIsUploaded,
  } = useUpload();

  const handleView = useCallback(
    async (row) => {
      try {
        console.log("🔄 Preparing fresh view for loan:", row.loanId);
        // Clear all old states before starting new view
        set_normalized_json(null);
        setReport({});
        set_filter_borrower("");
        setBorrowerList([]);
        setAnalyzedState({ isAnalyzed: false, analyzed_data: {} });
        setHasModifications(false);
        setIsSAClicked(false);
        setIsUploaded({ uploaded: false });

        // Make API call to load loan data
        const response = await api.post("/view-loan", {
          email: sessionStorage.getItem("email") || "",
          loanId: row.loanId,
        });

        const data = response.data;
        if (!Object.keys(data).length) {
          console.warn("⚠️ Empty response for loan:", row.loanId);
          return;
        }

        console.log("✅ Loan data fetched:", data);

        // Update context with fresh loan data
        sessionStorage.setItem("loanId", row.loanId || "");
        set_normalized_json(data.cleaned_data);
        setAnalyzedState({
          isAnalyzed: !!data.analyzed_data,
          analyzed_data: data.analyzed_data || {},
        });
        setHasModifications(!!data.hasModifications);

        // Move to extracted section
        handleViewChange();
      } catch (error) {
        console.error("❌ Error fetching loan data:", error);
      }
    },
    [
      handleViewChange,
      set_normalized_json,
      setReport,
      set_filter_borrower,
      setBorrowerList,
      setAnalyzedState,
      setHasModifications,
      setIsSAClicked,
      setIsUploaded,
    ]
  );

  const dataWithIndex = useMemo(
    () => (data || []).map((r, i) => ({ ...r, _originalIndex: i, sno: i + 1 })),
    [data]
  );

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
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
  }, []);

  const getComparableValue = (row, key) => {
    if (!key) return "";
    if (key === "sno") return Number(row.sno ?? row._originalIndex ?? 0);
    const v = row[key];
    if (Array.isArray(v)) return v.join(" ").toLowerCase();
    if (v === null || v === undefined) return "";
    return typeof v === "string" ? v.toLowerCase() : v;
  };

  const processedData = useMemo(() => {
    let filtered = dataWithIndex.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase();
        return (
          (row.loanId || "").toString().toLowerCase().includes(q) ||
          (row.fileName || "").toString().toLowerCase().includes(q) ||
          (Array.isArray(row.borrower) &&
            row.borrower.some((b) => (b || "").toLowerCase().includes(q))) ||
          (row.uploadedBy || "").toString().toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      const dir = direction === "asc" ? 1 : -1;
      filtered.sort((a, b) => {
        const av = getComparableValue(a, key);
        const bv = getComparableValue(b, key);
        if (typeof av === "number" && typeof bv === "number")
          return (av - bv) * dir;
        return (
          String(av).localeCompare(String(bv), undefined, { numeric: true }) *
          dir
        );
      });
    }
    return filtered;
  }, [dataWithIndex, search, statusFilter, sortConfig]);

  const columns = useMemo(
    () => [
      { id: "sno", label: "S.No", isCustom: true },
      { id: "loanId", label: "Loan ID" },
      { id: "fileName", label: "File Name" },
      { id: "borrower", label: "Borrower Name", isCustom: true },
      { id: "status", label: "Status", isCustom: true },
      { id: "lastUpdated", label: "Last Updated" },
      { id: "uploadedBy", label: "Uploaded By" },
      { id: "actions", label: "Actions", isCustom: true },
    ],
    []
  );

  const renderCustomCells = useCallback(
    (field, row, rowIndex) => {
      if (field === "sno") return row.sno ?? row._originalIndex + 1;

      if (field === "borrower") {
        if (!Array.isArray(row.borrower) || row.borrower.length === 0)
          return "-";
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
                onClick={() => setExpandedRow(isExpanded ? null : rowIndex)}
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

      if (field === "status") {
        const statusConfig = {
          Completed: { color: "green", Icon: CheckIcon, bgColor: "#C8E6C9" },
          Pending: {
            color: "goldenrod",
            Icon: MoreHorizIcon,
            bgColor: "#FFF9C4",
          },
          Error: {
            color: "red",
            Icon: ErrorOutlineOutlinedIcon,
            bgColor: "#FFCDD2",
          },
        };
        const config = statusConfig[row.status] || statusConfig.Error;
        return (
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: config.color }}>
                <config.Icon fontSize="small" sx={{ color: "white" }} />
              </Avatar>
            }
            label={row.status}
            sx={{
              backgroundColor: config.bgColor,
              color: config.color,
              fontWeight: "bold",
            }}
          />
        );
      }

      if (field === "actions") {
        return (
          <div className="flex items-center space-x-2">
            <button className="hover:underline" onClick={() => handleView(row)}>
              View
            </button>
            <span className="px-2 text-gray-600">|</span>
            <button className="hover:underline">Download</button>
          </div>
        );
      }
      return row[field] ?? "-";
    },
    [expandedRow, handleView]
  );

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
              onBlur={() => !search && setSearchOpen(false)}
              sx={{ minWidth: 260 }}
            />
          ) : (
            <Tooltip title="Search">
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
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
      <CustomTable
        columns={columns}
        data={processedData}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        renderCustomCells={renderCustomCells}
      />
    </div>
  );
};

export default React.memo(ProcessLoanTable);
