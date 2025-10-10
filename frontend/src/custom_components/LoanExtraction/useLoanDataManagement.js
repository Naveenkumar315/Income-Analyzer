import { useState, useEffect } from "react";
import { useUpload } from "../../context/UploadContext";
import api from "../../api/client";
import { toast } from "react-toastify";

/**
 * Custom hook to manage all loan data operations.
 * This includes state management for borrowers, selections, edits,
 * and all API interactions for adding, deleting, merging, and moving data.
 */
export const useLoanDataManagement = () => {
  const {
    normalized_json,
    set_normalized_json,
    setBorrowerList,
    set_filter_borrower,
    hasModifications,
    setHasModifications,
  } = useUpload();

  const [originalData, setOriginalData] = useState({});
  const [modifiedData, setModifiedData] = useState({});
  const [activeTab, setActiveTab] = useState("modified"); // 'modified' or 'original'

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBorrowers, setSelectedBorrowers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Initialize state when normalized_json changes
  useEffect(() => {
    if (normalized_json) {
      const snapshot = JSON.parse(JSON.stringify(normalized_json));
      setOriginalData(snapshot);
      setModifiedData(snapshot);
    }
  }, [normalized_json]);

  const currentData = activeTab === "original" ? originalData : modifiedData;
  const borrowers = currentData ? Object.keys(currentData) : [];

  // Update context with the latest borrower list from modified data
  useEffect(() => {
    if (activeTab === "modified") {
      const currentBorrowers = Object.keys(modifiedData) || [];
      setBorrowerList(currentBorrowers);
      if (!selectedBorrower && currentBorrowers.length > 0) {
        set_filter_borrower(currentBorrowers[0]);
      }
    }
  }, [
    activeTab,
    modifiedData,
    selectedBorrower,
    setBorrowerList,
    set_filter_borrower,
  ]);

  // --- Core API Helper ---
  const persistAndSetModified = async (updatedJson, actionTag, successMsg) => {
    try {
      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: actionTag,
        raw_json: updatedJson,
        hasModifications: true,
      });

      const cleanedJson = res?.data?.cleaned_json || updatedJson;
      setModifiedData(cleanedJson);
      set_normalized_json(cleanedJson); // Keep global context synced
      setActiveTab("modified");
      setHasModifications(true);
      if (successMsg) toast.success(successMsg);
      return true;
    } catch (err) {
      console.error(`${actionTag} error:`, err);
      toast.error("Operation failed. Please try again.");
      return false;
    }
  };

  // --- Event Handlers ---
  const handleAddBorrower = async (name) => {
    if (!name || !name.trim()) return;
    const currentBorrowers = Object.keys(modifiedData || {});
    if (
      currentBorrowers.some(
        (b) => b.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      toast.warn(`Borrower name "${name}" already exists!`);
      return;
    }
    const updated = { ...modifiedData, [name.trim()]: {} };
    await persistAndSetModified(
      updated,
      "add_borrower",
      `Borrower "${name}" added`
    );
  };

  const handleDeleteBorrower = async (name) => {
    if (!name) return;
    const updated = { ...modifiedData };
    delete updated[name];
    const success = await persistAndSetModified(
      updated,
      "delete_borrower",
      `Borrower "${name}" deleted`
    );
    if (success) {
      if (selectedBorrower === name) {
        setSelectedBorrower(null);
        setSelectedCategory(null);
      }
    }
  };

  const handleRenameBorrower = async (oldName, newName) => {
    if (!newName || !newName.trim() || oldName === newName) {
      setEditingBorrower(null);
      return;
    }
    const updated = { ...modifiedData };
    updated[newName.trim()] = updated[oldName];
    delete updated[oldName];
    const success = await persistAndSetModified(
      updated,
      "rename_borrower",
      `Renamed "${oldName}" → "${newName}"`
    );
    if (success) {
      if (selectedBorrower === oldName) setSelectedBorrower(newName);
      setEditingBorrower(null);
    }
  };

  const handleMerge = async (targetBorrower) => {
    if (!targetBorrower || selectedBorrowers.length < 2) return;
    const mergedData = JSON.parse(JSON.stringify(modifiedData));
    const sourceBorrowers = selectedBorrowers.filter(
      (b) => b !== targetBorrower
    );
    let targetCategories = mergedData[targetBorrower] || {};

    sourceBorrowers.forEach((source) => {
      const sourceCategories = mergedData[source] || {};
      Object.keys(sourceCategories).forEach((cat) => {
        if (!Array.isArray(targetCategories[cat])) targetCategories[cat] = [];
        targetCategories[cat].push(...sourceCategories[cat]);
      });
      delete mergedData[source];
    });

    mergedData[targetBorrower] = targetCategories;
    const success = await persistAndSetModified(
      mergedData,
      "folder_merge",
      `Merged folders into ${targetBorrower}`
    );
    if (success) {
      setSelectMode(false);
      setSelectedBorrowers([]);
    }
  };

  const handleMove = async (toBorrower) => {
    if (!toBorrower || selectedFiles.length === 0) return;
    const movedData = JSON.parse(JSON.stringify(modifiedData));

    selectedFiles.forEach(({ borrower, category, docs }) => {
      // Add docs to target
      if (!movedData[toBorrower]) movedData[toBorrower] = {};
      if (!movedData[toBorrower][category])
        movedData[toBorrower][category] = [];
      movedData[toBorrower][category].push(...docs);

      // Remove category from source
      if (movedData[borrower] && movedData[borrower][category]) {
        delete movedData[borrower][category];
        // If borrower has no categories left, remove borrower
        if (Object.keys(movedData[borrower]).length === 0) {
          delete movedData[borrower];
        }
      }
    });

    const success = await persistAndSetModified(
      movedData,
      "file_merge",
      `Moved ${selectedFiles.length} category(ies) to ${toBorrower}`
    );
    if (success) {
      setSelectMode(false);
      setSelectedFiles([]);
    }
  };

  const handleViewOriginal = async () => {
    try {
      const res = await api.post("/get-original-data", {
        email: sessionStorage.getItem("email") || "",
        loanId: sessionStorage.getItem("loanId") || "",
      });
      const cleanedData = res?.data?.cleaned_data || {};
      setOriginalData(cleanedData);
      setActiveTab("original");
      setSelectedBorrower(null);
      setSelectedCategory(null);
      toast.success("Fetched original borrower data.");
    } catch (error) {
      console.error("Error fetching original data:", error);
      toast.error("Failed to fetch original data.");
    }
  };

  const handleExitOriginalView = () => {
    setActiveTab("modified");
    setSelectedBorrower(null);
    setSelectedCategory(null);
  };

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

  const isCategorySelected = (borrower, category) =>
    selectedFiles.some(
      (f) => f.borrower === borrower && f.category === category
    );

  const handleCategoryClick = (borrower, category) => {
    setSelectedBorrower(borrower);
    setSelectedCategory(category);
  };

  return {
    // State
    currentData,
    borrowers,
    activeTab,
    hasModifications,
    openBorrowers,
    selectedBorrower,
    selectedCategory,
    selectMode,
    selectedBorrowers,
    selectedFiles,
    editingBorrower,
    editingName,
    // Setters
    setSelectMode,
    setSelectedBorrowers,
    setSelectedFiles,
    setEditingBorrower,
    setEditingName,
    // Handlers
    toggleBorrower,
    handleAddBorrower,
    handleDeleteBorrower,
    handleRenameBorrower,
    handleMerge,
    handleMove,
    handleViewOriginal,
    handleExitOriginalView,
    isCategorySelected,
    handleCategoryClick,
  };
};
