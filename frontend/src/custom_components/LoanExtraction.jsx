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
import api from "../api/client";
import ConfirmMoveModal from "./ConfirmMoveModal";
import ConfirmMergeModal from "./ConfirmMergeModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { toast } from "react-toastify";
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

  // UI state
  const [rulesModel, setRulesModel] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [modifiedData, setModifiedData] = useState({});
  const [activeTab, setActiveTab] = useState("modified");

  // selection / navigation state
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [addBorrower, setAddBorrower] = useState({
    model: false,
    borrowerName: "",
  });

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBorrowers, setSelectedBorrowers] = useState([]); // borrower-level selections
  const [selectedFiles, setSelectedFiles] = useState([]); // category-level selections (borrower+category+docs)

  // anchors & modals
  const [mergeAnchorEl, setMergeAnchorEl] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // helper for resetting the right-panel component so activeDoc goes to 0
  const [panelResetKey, setPanelResetKey] = useState(0);

  // initial load of normalized json
  useEffect(() => {
    if (normalized_json) {
      const snapshot = JSON.parse(JSON.stringify(normalized_json));
      setOriginalData(snapshot);
      setModifiedData(snapshot);
    }
  }, [normalized_json]);

  const currentData = activeTab === "original" ? originalData : modifiedData;
  const borrowers = currentData ? Object.keys(currentData) : [];

  // keep borrower list in sync
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

  // clean openBorrowers map when borrowers change
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

  // persist helper
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

  // Move a single document or entire category (called from right panel)
  // Replace your existing handleMoveDocument with this
  const handleMoveDocument = async (docIndex, toBorrower, subCategory) => {
    if (!selectedBorrower || !selectedCategory || !toBorrower) return;

    try {
      // Work on a deep copy of modifiedData to avoid accidental shared refs
      const updated = JSON.parse(JSON.stringify(modifiedData));

      // CASE 1: Move entire category (docIndex === null)
      if (docIndex === null) {
        const fromCat = subCategory || selectedCategory;
        const fullSection = updated[selectedBorrower]?.[fromCat] || [];

        if (fullSection.length === 0) {
          toast.warning(`No data to move from ${fromCat}`);
          return;
        }

        // Ensure target borrower/category exist
        if (!updated[toBorrower]) updated[toBorrower] = {};
        if (!updated[toBorrower][fromCat]) updated[toBorrower][fromCat] = [];

        // Deep clone items when appending to avoid reference sharing
        const clones = fullSection.map((d) => JSON.parse(JSON.stringify(d)));
        updated[toBorrower][fromCat] = [
          ...(updated[toBorrower][fromCat] || []),
          ...clones,
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

        // Reset selection to the moved-to borrower/category
        setSelectedBorrower(toBorrower);
        setSelectedCategory(fromCat);
        setPanelResetKey(Date.now());
        return;
      }

      // CASE 2: Move single document (row-level move)
      // Use a direct reference to the source list in updated (we already deep-copied modifiedData)
      const sourceList =
        updated[selectedBorrower][subCategory || selectedCategory] || [];

      // Defensive: ensure docIndex exists in sourceList
      if (docIndex < 0 || docIndex >= sourceList.length) {
        toast.error("Invalid document index");
        return;
      }

      // Extract and deep-clone the moved doc so destination gets its own copy
      const movedDocClone = JSON.parse(JSON.stringify(sourceList[docIndex]));

      // Remove the item from the source list by index
      sourceList.splice(docIndex, 1);

      // Ensure target borrower/category exist
      if (!updated[toBorrower]) updated[toBorrower] = {};
      if (!updated[toBorrower][subCategory || selectedCategory])
        updated[toBorrower][subCategory || selectedCategory] = [];

      // Append the cloned doc
      updated[toBorrower][subCategory || selectedCategory].push(movedDocClone);

      // If source category became empty, delete it
      if (
        updated[selectedBorrower][subCategory || selectedCategory]?.length === 0
      ) {
        delete updated[selectedBorrower][subCategory || selectedCategory];
      }

      // If borrower became empty, delete borrower
      if (Object.keys(updated[selectedBorrower] || {}).length === 0) {
        delete updated[selectedBorrower];
      }

      await persistAndSetModified(
        updated,
        "doc_move",
        `Moved ${subCategory || selectedCategory} document to ${toBorrower}`
      );

      // Focus on the moved-to borrower/category
      setSelectedBorrower(toBorrower);
      setSelectedCategory(subCategory || selectedCategory);
      setPanelResetKey(Date.now());
    } catch (err) {
      console.error("Error moving document/category:", err);
      toast.error("Failed to move. Please try again.");
    }
  };

  // Batch merge selected borrowers into targetBorrower
  const handleMerge = async (targetBorrower) => {
    if (!targetBorrower || selectedBorrowers.length === 0) return;
    try {
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

      // reset selection UI
      setSelectMode(false);
      setSelectedBorrowers([]);
      setMergeModal(null);
      setMergeAnchorEl(null);
    } catch (err) {
      console.error("Merge error:", err);
      toast.error("Merge failed. Please try again.");
    }
  };

  // Batch move selected category groups to a borrower
  const handleMove = async (toBorrower) => {
    if (!toBorrower || selectedFiles.length === 0) return;
    try {
      const mergedData = JSON.parse(JSON.stringify(modifiedData));
      selectedFiles.forEach(({ borrower, category, docs }) => {
        if (!mergedData[toBorrower]) mergedData[toBorrower] = {};
        if (!mergedData[toBorrower][category])
          mergedData[toBorrower][category] = [];
        mergedData[toBorrower][category] =
          mergedData[toBorrower][category].concat(docs);

        // clear moved category from source
        if (mergedData[borrower] && mergedData[borrower][category])
          mergedData[borrower][category] = [];
      });

      // cleanup empty categories and borrowers
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
      Object.keys(mergedData).forEach((b) => {
        if (!Object.keys(mergedData[b] || {}).length) delete mergedData[b];
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
    } catch (err) {
      console.error("Batch move error:", err);
      toast.error("Move failed. Please try again.");
    }
  };

  // delete borrower
  const handleDeleteBorrower = async (name) => {
    if (!name) return;
    try {
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
    } catch (err) {
      console.error("Delete borrower error:", err);
      toast.error("Delete failed. Please try again.");
    }
  };

  // helper to check if a category for a borrower is selected (used for checkboxes)
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
        </div>

        {/* Main layout */}
        <div className="flex flex-1 min-h-0">
          {isUploaded?.uploaded || normalized_json ? (
            <ResizableLayout
              left={
                <div className="h-full flex flex-col">
                  {/* toolbar */}
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
                              onClick={() => setActiveTab("original")}
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

                  {/* Borrowers list with checkboxes */}
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
                                          setPanelResetKey(Date.now());
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
                                                          f.borrower === name &&
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
                        key={panelResetKey}
                        borrower={selectedBorrower}
                        category={selectedCategory}
                        docs={
                          currentData[selectedBorrower][selectedCategory] || []
                        }
                        borrowersList={Object.keys(currentData || {})}
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

        {/* Floating rules button */}
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

        {/* --- MERGE MENU (triggered by mergeAnchorEl) --- */}
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

        {/* --- MOVE MENU (triggered by moveAnchorEl) --- */}
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
                    from: selectedFiles[0]?.borrower || "",
                    to: b,
                    files: selectedFiles,
                  });
                }}
              >
                {b}
              </MenuItem>
            ))}
        </Menu>

        {/* Add borrower modal */}
        {addBorrower?.model && (
          <EnterBorrowerName
            setAddBorrower={setAddBorrower}
            addBorrower={addBorrower}
          />
        )}

        {/* Confirm modals */}
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
      </div>
    </>
  );
};

export default React.memo(LoanExtraction);
