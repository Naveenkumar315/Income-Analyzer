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

  // ✅ FIXED: Borrower list sync (no infinite loop)
  useEffect(() => {
    if (activeTab !== "modified") return;
    const borrowersFromData = Object.keys(modifiedData || {});
    const currentList = borrowerList || [];

    // update borrower list only if actually changed
    if (JSON.stringify(borrowersFromData) !== JSON.stringify(currentList)) {
      setBorrowerList(borrowersFromData);
    }

    // set first borrower only once when empty
    if (!filtered_borrower && borrowersFromData.length > 0) {
      set_filter_borrower(borrowersFromData[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifiedData]);

  // ✅ FIXED: Clean openBorrowers without causing re-renders
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

  // Persist to DB and mark hasModifications = true
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

  const handleAddBorrower = async (name) => {
    if (!name || !name.trim()) return;
    const updated = { ...modifiedData, [name]: {} };
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
    await persistAndSetModified(
      updated,
      "delete_borrower",
      `Borrower "${name}" deleted`
    );
    setDeleteModal(null);
    if (selectedBorrower === name) {
      setSelectedBorrower(null);
      setSelectedCategory(null);
    }
  };

  const handleRenameBorrower = async (oldName, newName) => {
    if (!newName || !newName.trim()) return setEditingBorrower(null);
    if (oldName === newName) return setEditingBorrower(null);
    const updated = { ...modifiedData };
    updated[newName] = updated[oldName];
    delete updated[oldName];
    await persistAndSetModified(
      updated,
      "rename_borrower",
      `Renamed "${oldName}" → "${newName}"`
    );
    setEditingBorrower(null);
    if (selectedBorrower === oldName) setSelectedBorrower(newName);
  };

  const handleMerge = async (targetBorrower) => {
    if (!targetBorrower || selectedBorrowers.length === 0) return;
    const mergedData = JSON.parse(JSON.stringify(modifiedData));
    const others = selectedBorrowers.filter((b) => b !== targetBorrower);
    let baseCats = mergedData[targetBorrower] || {};
    others.forEach((b) => {
      const targetCats = mergedData[b] || {};
      Object.keys(targetCats).forEach((cat) => {
        if (!Array.isArray(baseCats[cat])) baseCats[cat] = [];
        baseCats[cat] = baseCats[cat].concat(targetCats[cat]);
      });
      delete mergedData[b];
    });
    mergedData[targetBorrower] = baseCats;
    await persistAndSetModified(
      mergedData,
      "folder_merge",
      `Merged ${others.join(", ")} into ${targetBorrower}`
    );
    setSelectMode(false);
    setSelectedBorrowers([]);
    setMergeModal(null);
    setMergeAnchorEl(null);
  };

  const handleMove = async (toBorrower) => {
    if (!toBorrower || selectedFiles.length === 0) return;
    const mergedData = JSON.parse(JSON.stringify(modifiedData));
    selectedFiles.forEach(({ borrower, category, docs }) => {
      if (!mergedData[toBorrower]) mergedData[toBorrower] = {};
      if (!mergedData[toBorrower][category])
        mergedData[toBorrower][category] = [];
      mergedData[toBorrower][category] =
        mergedData[toBorrower][category].concat(docs);
      if (mergedData[borrower] && mergedData[borrower][category]) {
        mergedData[borrower][category] = [];
      }
    });
    Object.keys(mergedData).forEach((b) => {
      Object.keys(mergedData[b] || {}).forEach((cat) => {
        if (
          Array.isArray(mergedData[b][cat]) &&
          mergedData[b][cat].length === 0
        ) {
          delete mergedData[b][cat];
        }
      });
    });
    await persistAndSetModified(
      mergedData,
      "file_merge",
      `Moved ${selectedFiles.length} category(ies) to ${toBorrower}`
    );
    setSelectMode(false);
    setSelectedFiles([]);
    setMoveModal(null);
    setMoveAnchorEl(null);
  };

  // Load original data from DB
  const handleViewOriginalData = async () => {
    try {
      const res = await api.post("/get-original-data", {
        email: sessionStorage.getItem("email") || "",
        loanId: sessionStorage.getItem("loanId") || "",
      });

      const newOriginal =
        res?.data?.original_cleaned_data || res?.data?.cleaned_data || {};
      setOriginalData(newOriginal);
      setActiveTab("original");
      setSelectedBorrower(null);
      setSelectedCategory(null);
      toast.info("Loaded original data from database");
    } catch (err) {
      console.error("Error fetching original data:", err);
      toast.error("Failed to load original data");
    }
  };

  const isCategorySelected = (borrower, category) =>
    selectedFiles.some(
      (f) => f.borrower === borrower && f.category === category
    );

  // 🔹 Handle moving a document OR an entire category to another borrower
  const handleMoveDocument = async (docIndex, toBorrower, subCategory) => {
    if (!selectedBorrower || !selectedCategory || !toBorrower) return;

    try {
      const updated = JSON.parse(JSON.stringify(modifiedData));

      // Case 1️⃣: Move the entire category (triggered by top Move icon)
      if (docIndex === null) {
        const fromCat = subCategory || selectedCategory;
        const fullSection = updated[selectedBorrower]?.[fromCat] || [];

        if (fullSection.length === 0) {
          toast.warning(`No data to move from ${fromCat}`);
          return;
        }

        // Ensure target borrower + category exist
        if (!updated[toBorrower]) updated[toBorrower] = {};
        if (!updated[toBorrower][fromCat]) updated[toBorrower][fromCat] = [];

        // Move the entire category array
        updated[toBorrower][fromCat] = [
          ...(updated[toBorrower][fromCat] || []),
          ...fullSection,
        ];

        // Remove category from source borrower
        delete updated[selectedBorrower][fromCat];

        // If borrower has no remaining categories, remove borrower
        if (Object.keys(updated[selectedBorrower] || {}).length === 0) {
          delete updated[selectedBorrower];
        }

        await persistAndSetModified(
          updated,
          "category_move",
          `Moved entire ${fromCat} section to ${toBorrower}`
        );

        // Reset selected borrower/category to the target
        setSelectedBorrower(toBorrower);
        setSelectedCategory(fromCat);
        return;
      }

      // Case 2️⃣: Move single document (row-level move)
      const currentDocs =
        updated[selectedBorrower][subCategory || selectedCategory] || [];
      const [movedDoc] = currentDocs.splice(docIndex, 1);

      if (!updated[toBorrower]) updated[toBorrower] = {};
      if (!updated[toBorrower][subCategory || selectedCategory])
        updated[toBorrower][subCategory || selectedCategory] = [];

      updated[toBorrower][subCategory || selectedCategory].push(movedDoc);

      // Remove empty category if necessary
      if (
        updated[selectedBorrower][subCategory || selectedCategory]?.length === 0
      ) {
        delete updated[selectedBorrower][subCategory || selectedCategory];
      }

      // Remove borrower entirely if now empty
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
    } catch (err) {
      console.error("Error moving document/category:", err);
      toast.error("Failed to move. Please try again.");
    }
  };

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
            <>
              <ResizableLayout
                left={
                  <div className="h-full flex flex-col">
                    {/* Toolbar */}
                    {!selectMode ? (
                      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-4">
                          {activeTab === "modified" && (
                            <>
                              <button
                                className="text-sm text-[#26a3dd]"
                                onClick={() =>
                                  setAddBorrower({
                                    model: true,
                                    borrowerName: "",
                                    onSave: handleAddBorrower,
                                  })
                                }
                              >
                                Add Borrower
                              </button>
                              <button
                                className="text-sm text-gray-600 hover:text-[#26a3dd]"
                                onClick={() => setSelectMode(true)}
                              >
                                Select
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {hasModifications && activeTab === "modified" && (
                            <Tooltip title="View Original Data">
                              <TbDatabaseEdit
                                className="text-gray-600 cursor-pointer"
                                onClick={handleViewOriginalData}
                              />
                            </Tooltip>
                          )}
                          {activeTab === "original" && (
                            <CloseIcon
                              className="text-red-500 cursor-pointer"
                              onClick={() => setActiveTab("modified")}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end bg-gray-50 border-b border-gray-200 px-4 py-2 shadow-sm">
                        <div className="flex gap-4 items-center">
                          <Tooltip title="Merge Selected">
                            <TbArrowMerge
                              size={22}
                              className={`cursor-pointer ${
                                selectedBorrowers.length > 0
                                  ? "text-[#26a3dd]"
                                  : "text-gray-300"
                              }`}
                              onClick={(e) => {
                                if (selectedBorrowers.length === 0) return;
                                setMergeAnchorEl(e.currentTarget);
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Move Selected">
                            <TbArrowRight
                              size={22}
                              className={`cursor-pointer ${
                                selectedFiles.length > 0
                                  ? "text-[#26a3dd]"
                                  : "text-gray-300"
                              }`}
                              onClick={(e) => {
                                if (selectedFiles.length === 0) return;
                                setMoveAnchorEl(e.currentTarget);
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Cancel Selection">
                            <CloseIcon
                              className="text-red-500 cursor-pointer"
                              onClick={() => {
                                setSelectMode(false);
                                setSelectedBorrowers([]);
                                setSelectedFiles([]);
                              }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    )}

                    {/* Borrowers list and categories */}
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                      <ul className="space-y-2">
                        {borrowers.map((name) => {
                          const categories = Object.keys(
                            currentData[name] || {}
                          );
                          const isEditing =
                            activeTab === "modified" &&
                            editingBorrower === name;

                          return (
                            <li key={name}>
                              <div
                                className="group flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md"
                                onClick={() => toggleBorrower(name)}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {activeTab === "modified" && selectMode && (
                                    <Checkbox
                                      size="small"
                                      checked={selectedBorrowers.includes(name)}
                                      onChange={(e) => {
                                        setSelectedBorrowers((prev) =>
                                          e.target.checked
                                            ? [...prev, name]
                                            : prev.filter((b) => b !== name)
                                        );
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  <PersonSharpIcon fontSize="small" />
                                  {isEditing ? (
                                    <input
                                      value={editingName}
                                      onChange={(e) =>
                                        setEditingName(e.target.value)
                                      }
                                      className="border px-1 rounded text-sm flex-1"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="font-medium">{name}</span>
                                  )}
                                </div>

                                {activeTab === "modified" && !selectMode && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isEditing ? (
                                      <>
                                        <SaveIcon
                                          fontSize="small"
                                          className="text-green-700 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRenameBorrower(
                                              name,
                                              editingName
                                            );
                                          }}
                                        />
                                        <CloseIcon
                                          fontSize="small"
                                          className="text-gray-600 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBorrower(null);
                                            setEditingName("");
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <EditIcon
                                          fontSize="small"
                                          className="text-gray-600 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBorrower(name);
                                            setEditingName(name);
                                          }}
                                        />
                                        <DeleteIcon
                                          fontSize="small"
                                          className="text-red-700 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteModal(name);
                                          }}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
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
                                    const isSelected = isCategorySelected(
                                      name,
                                      cat
                                    );
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
                                          }}
                                        >
                                          {activeTab === "modified" &&
                                            selectMode && (
                                              <Checkbox
                                                size="small"
                                                checked={isSelected}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setSelectedFiles((prev) => [
                                                      ...prev,
                                                      {
                                                        borrower: name,
                                                        category: cat,
                                                        docs,
                                                      },
                                                    ]);
                                                  } else {
                                                    setSelectedFiles((prev) =>
                                                      prev.filter(
                                                        (f) =>
                                                          !(
                                                            f.borrower ===
                                                              name &&
                                                            f.category === cat
                                                          )
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            )}
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
                          borrower={selectedBorrower}
                          category={selectedCategory}
                          docs={
                            currentData[selectedBorrower][selectedCategory] ||
                            []
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
            </>
          ) : (
            <UnuploadedScreen setShowSection={setShowSection} />
          )}
        </div>

        {/* Floating Rules Button */}
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

      {/* Modals */}
      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
          from_name={addBorrower.from || ""}
          to_name={addBorrower.to || ""}
        />
      )}

      {mergeModal && (
        <ConfirmMergeModal
          borrowers={selectedBorrowers}
          target={mergeModal.target}
          onCancel={() => setMergeModal(null)}
          onConfirm={() => handleMerge(mergeModal.target)}
        />
      )}

      {moveModal && (
        <ConfirmMoveModal
          fromBorrower={moveModal.from}
          toBorrower={moveModal.to}
          files={moveModal.files}
          onCancel={() => setMoveModal(null)}
          onConfirm={() => handleMove(moveModal.to)}
        />
      )}

      {deleteModal && (
        <ConfirmDeleteModal
          borrower={deleteModal}
          onCancel={() => setDeleteModal(null)}
          onConfirm={(b) => handleDeleteBorrower(b)}
        />
      )}

      {/* Merge Dropdown */}
      <Menu
        anchorEl={mergeAnchorEl}
        open={Boolean(mergeAnchorEl)}
        onClose={() => setMergeAnchorEl(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Merge selected into
        </div>
        {borrowers
          .filter((b) => !selectedBorrowers.includes(b))
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setMergeAnchorEl(null);
                setMergeModal({ target: b });
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>

      {/* Move Dropdown */}
      <Menu
        anchorEl={moveAnchorEl}
        open={Boolean(moveAnchorEl)}
        onClose={() => setMoveAnchorEl(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move categories to
        </div>
        {borrowers
          .filter((b) => !selectedFiles.some((f) => f.borrower === b))
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setMoveAnchorEl(null);
                setMoveModal({
                  from: selectedFiles[0].borrower,
                  to: b,
                  files: selectedFiles,
                });
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default React.memo(LoanExtraction);
