import React, { useEffect, useState } from "react";
import UploadedModel from "./UploadedModel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";
import { useUpload } from "../context/UploadContext";
import LoanPackagePanel from "./LoanPackagePanel";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FaFolder } from "react-icons/fa";
import EnterBorrowerName from "./EnterBorrowerName";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { TbArrowMerge, TbArrowRight, TbDatabaseEdit } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import api from "../api/client";
import ConfirmMoveModal from "./ConfirmMoveModal";
import ConfirmMergeModal from "./ConfirmMergeModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Tooltip from "@mui/material/Tooltip";
import ResizableLayout from "../utils/ResizableLayout";

const LoanExtraction = ({
  showSection = {},
  setShowSection = () => {},
  goBack,
  handleStepChange = () => {},
}) => {
  const {
    isUploaded,
    normalized_json,
    analyzedState,
    setIsSAClicked,
    setAnalyzedState,
    setReport,
    filtered_borrower,
    set_filter_borrower,
    borrowerList,
    setBorrowerList,
    set_normalized_json,
    hasModifications,
    setHasModifications,
  } = useUpload();

  const [rulesModel, setRulesModel] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [modifiedData, setModifiedData] = useState({});
  const [activeTab, setActiveTab] = useState("modified");

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [addBorrower, setAddBorrower] = useState({
    model: false,
    borrowerName: "",
  });

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBorrowers, setSelectedBorrowers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [mergeAnchorEl, setMergeAnchorEl] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  // ✅ added to reset right panel state
  const [panelResetKey, setPanelResetKey] = useState(0);

  // Load normalized JSON initially
  useEffect(() => {
    if (normalized_json) {
      const snapshot = JSON.parse(JSON.stringify(normalized_json));
      setOriginalData(snapshot);
      setModifiedData(snapshot);
    }
  }, [normalized_json]);

  const currentData = activeTab === "original" ? originalData : modifiedData;
  const borrowers = currentData ? Object.keys(currentData) : [];

  // ✅ Borrower list sync
  useEffect(() => {
    if (activeTab !== "modified") return;
    const borrowersFromData = Object.keys(modifiedData || {});
    const currentList = borrowerList || [];

    if (JSON.stringify(borrowersFromData) !== JSON.stringify(currentList)) {
      setBorrowerList(borrowersFromData);
    }

    if (!filtered_borrower && borrowersFromData.length > 0) {
      set_filter_borrower(borrowersFromData[0]);
    }
  }, [modifiedData]);

  // ✅ Clean openBorrowers
  useEffect(() => {
    if (!borrowers?.length) return;
    setOpenBorrowers((prev) => {
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([b]) => borrowers.includes(b))
      );
      if (JSON.stringify(cleaned) !== JSON.stringify(prev)) return cleaned;
      return prev;
    });
  }, [borrowers]);

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

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

      setModifiedData(res?.data?.cleaned_json || updatedJson);
      setActiveTab("modified");
      setHasModifications(true);
      toast.success(successMsg);
    } catch (err) {
      console.error(`${actionTag} error:`, err);
      toast.error("Operation failed. Please try again.");
    }
  };

  // ✅ --- handleMoveDocument (the missing function) ---
  const handleMoveDocument = async (docIndex, toBorrower, subCategory) => {
    if (!selectedBorrower || !selectedCategory || !toBorrower) return;

    try {
      const updated = JSON.parse(JSON.stringify(modifiedData));

      // Case 1️⃣: Move entire category
      if (docIndex === null) {
        const fromCat = subCategory || selectedCategory;
        const fullSection = updated[selectedBorrower]?.[fromCat] || [];

        if (fullSection.length === 0) {
          toast.warning(`No data to move from ${fromCat}`);
          return;
        }

        if (!updated[toBorrower]) updated[toBorrower] = {};
        if (!updated[toBorrower][fromCat]) updated[toBorrower][fromCat] = [];

        updated[toBorrower][fromCat] = [
          ...(updated[toBorrower][fromCat] || []),
          ...fullSection,
        ];

        delete updated[selectedBorrower][fromCat];

        if (Object.keys(updated[selectedBorrower] || {}).length === 0) {
          delete updated[selectedBorrower];
        }

        await persistAndSetModified(
          updated,
          "category_move",
          `Moved entire ${fromCat} section to ${toBorrower}`
        );

        setSelectedBorrower(toBorrower);
        setSelectedCategory(fromCat);
        setPanelResetKey(Date.now()); // ✅ also reset panel on move
        return;
      }

      // Case 2️⃣: Move single document
      const currentDocs =
        updated[selectedBorrower][subCategory || selectedCategory] || [];
      const [movedDoc] = currentDocs.splice(docIndex, 1);

      if (!updated[toBorrower]) updated[toBorrower] = {};
      if (!updated[toBorrower][subCategory || selectedCategory])
        updated[toBorrower][subCategory || selectedCategory] = [];

      updated[toBorrower][subCategory || selectedCategory].push(movedDoc);

      if (
        updated[selectedBorrower][subCategory || selectedCategory]?.length === 0
      ) {
        delete updated[selectedBorrower][subCategory || selectedCategory];
      }

      if (Object.keys(updated[selectedBorrower]).length === 0) {
        delete updated[selectedBorrower];
      }

      await persistAndSetModified(
        updated,
        "doc_move",
        `Moved ${subCategory || selectedCategory} document to ${toBorrower}`
      );

      setSelectedBorrower(toBorrower);
      setSelectedCategory(subCategory || selectedCategory);
      setPanelResetKey(Date.now());
    } catch (err) {
      console.error("Error moving document/category:", err);
      toast.error("Failed to move. Please try again.");
    }
  };
  // ✅ --- end handleMoveDocument ---

  const isCategorySelected = (borrower, category) =>
    selectedFiles.some(
      (f) => f.borrower === borrower && f.category === category
    );

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 px-6 pt-4 bg-white border-b border-gray-200">
          <div className="font-medium text-gray-700">
            Loan ID : {sessionStorage.getItem("loanId") || ""}
          </div>

          {(isUploaded?.uploaded || normalized_json) && (
            <div className="flex items-center gap-3">
              {analyzedState?.isAnalyzed && (
                <Button
                  variant="start-analyze"
                  width={160}
                  label="View Result"
                  onClick={() => {
                    setIsSAClicked(false);
                    setShowSection((p) => ({
                      ...p,
                      startAnalyzing: true,
                      processLoanSection: false,
                      provideLoanIDSection: false,
                      extractedSection: false,
                    }));
                    handleStepChange(1);
                  }}
                />
              )}
              <Button
                variant="upload-doc"
                width={180}
                label="Upload Documents"
                onClick={() =>
                  setShowSection((p) => ({ ...p, uploadedModel: true }))
                }
              />
              <Button
                variant="start-analyze"
                width={160}
                label="Start Analyzing"
                onClick={() => {
                  setReport({});
                  setAnalyzedState((prev) => ({
                    ...prev,
                    isAnalyzed: false,
                    analyzed_data: {},
                  }));
                  setShowSection((p) => ({
                    ...p,
                    startAnalyzing: true,
                    processLoanSection: false,
                    provideLoanIDSection: false,
                    extractedSection: false,
                  }));
                }}
              />
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 min-h-0">
          {isUploaded?.uploaded || normalized_json ? (
            <ResizableLayout
              left={
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto px-4 py-2">
                    <ul className="space-y-2">
                      {borrowers.map((name) => {
                        const categories = Object.keys(currentData[name] || {});
                        return (
                          <li key={name}>
                            <div
                              className="group flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md"
                              onClick={() => toggleBorrower(name)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <PersonSharpIcon fontSize="small" />
                                <span className="font-medium">{name}</span>
                              </div>
                              {openBorrowers[name] ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </div>

                            {openBorrowers[name] && (
                              <ul className="ml-8 mt-2 space-y-1">
                                {categories.map((cat) => {
                                  const docs = currentData[name][cat] || [];
                                  return (
                                    <li key={cat}>
                                      <div
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                                          selectedBorrower === name &&
                                          selectedCategory === cat
                                            ? "bg-blue-50 border border-blue-300"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          setSelectedBorrower(name);
                                          setSelectedCategory(cat);
                                          setPanelResetKey(Date.now()); // ✅ resets doc index
                                        }}
                                      >
                                        <FaFolder className="text-gray-500" />
                                        <span className="truncate text-sm font-medium">
                                          {cat}
                                        </span>
                                        <span className="ml-auto text-xs text-gray-500">
                                          ({docs.length})
                                        </span>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              }
              right={
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedBorrower &&
                    currentData[selectedBorrower] &&
                    selectedCategory &&
                    currentData[selectedBorrower][selectedCategory] ? (
                      <LoanPackagePanel
                        key={panelResetKey}
                        borrower={selectedBorrower}
                        category={selectedCategory}
                        docs={
                          currentData[selectedBorrower][selectedCategory] || []
                        }
                        borrowersList={Object.keys(modifiedData || {})}
                        onMoveDocument={handleMoveDocument}
                        isModifiedView={activeTab === "modified"}
                      />
                    ) : (
                      <div className="text-gray-400 flex items-center justify-center h-full">
                        Select a category to view documents
                      </div>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
            <UnuploadedScreen setShowSection={setShowSection} />
          )}
        </div>

        <div className="fixed bottom-4 right-4 w-[50px] h-[50px] bg-[#12699D] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f5a7a] transition-colors">
          <DescriptionIcon
            onClick={() => setRulesModel(true)}
            className="text-white cursor-pointer"
          />
        </div>

        <UnderwritingRulesModel
          rulesModel={rulesModel}
          OpenRulesModel={setRulesModel}
        />
        {showSection.uploadedModel && (
          <UploadedModel setShowSection={setShowSection} />
        )}
      </div>
    </>
  );
};

export default React.memo(LoanExtraction);
