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
import { TbArrowMerge, TbArrowRight } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import api from "../api/client";
import ConfirmMoveModal from "./ConfirmMoveModal";
import ConfirmMergeModal from "./ConfirmMergeModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { toast } from "react-toastify";

const LoanExtraction = ({
  showSection = {},
  setShowSection = () => {},
  goBack,
}) => {
  const { isUploaded, normalized_json } = useUpload();

  const [rulesModel, setRulesModel] = useState(false);

  // data states
  const [originalData, setOriginalData] = useState({});
  const [modifiedData, setModifiedData] = useState({});
  const [activeTab, setActiveTab] = useState("original");

  // selection & UI
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [addBorrower, setAddBorrower] = useState({
    model: false,
    borrowerName: "",
  });

  // select/multi modes
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBorrowers, setSelectedBorrowers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // merge/move UI
  const [mergeAnchorEl, setMergeAnchorEl] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  // edit/delete borrower (only for modified tab)
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  // initialize
  useEffect(() => {
    if (normalized_json) {
      const snapshot = JSON.parse(JSON.stringify(normalized_json));
      setOriginalData(snapshot);
      setModifiedData(snapshot);
    }
  }, [normalized_json]);

  const currentData = activeTab === "original" ? originalData : modifiedData;
  const borrowers = currentData ? Object.keys(currentData) : [];

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

  // helper: persist to DB
  const persistAndSetModified = async (updatedJson, actionTag, successMsg) => {
    try {
      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: actionTag,
        raw_json: updatedJson,
      });
      setModifiedData(res.data.cleaned_json);
      setActiveTab("modified");
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      console.error(`${actionTag} error:`, err);
      toast.error("Operation failed. Please try again.");
    }
  };

  // add borrower
  const handleAddBorrower = async (name) => {
    if (!name || !name.trim()) return;
    const updated = { ...modifiedData, [name]: {} };
    await persistAndSetModified(
      updated,
      "add_borrower",
      `Borrower "${name}" added`
    );
  };

  // delete borrower
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

  // rename borrower
  const handleRenameBorrower = async (oldName, newName) => {
    if (!newName || !newName.trim()) {
      setEditingBorrower(null);
      return;
    }
    if (oldName === newName) {
      setEditingBorrower(null);
      return;
    }
    const updated = { ...modifiedData };
    updated[newName] = updated[oldName];
    delete updated[oldName];
    await persistAndSetModified(
      updated,
      "rename_borrower",
      `Renamed "${oldName}" → "${newName}"`
    );
    setEditingBorrower(null);
    if (selectedBorrower === oldName) {
      setSelectedBorrower(newName);
    }
  };

  // merge
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

  // move
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

  const isCategorySelected = (borrower, category) =>
    selectedFiles.some(
      (f) => f.borrower === borrower && f.category === category
    );

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 px-4 pt-4 bg-white border-b border-gray-200">
          <div className="font-medium">
            Loan ID : {sessionStorage.getItem("loanId") || ""}
          </div>
        </div>

        {/* Tabs */}
        {/* Tabs */}
        <div className="flex px-4 border-b border-gray-200 bg-white">
          {["original", "modified"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // Clear right side selection when switching tabs
                setSelectedBorrower(null);
                setSelectedCategory(null);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:border-gray-300"
              }`}
            >
              {tab === "original" ? "Original Data" : "Modified Data"}
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-h-0">
          {isUploaded?.uploaded ? (
            <>
              {/* Left Panel */}
              <div className="w-[25%] border-r border-gray-300 flex flex-col">
                {/* Top actions (only in modified) */}
                {activeTab === "modified" && (
                  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                    {selectMode ? (
                      <div className="flex gap-4 items-center">
                        <TbArrowMerge
                          size={20}
                          className={`cursor-pointer ${
                            selectedBorrowers.length > 0
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                          onClick={(e) => {
                            if (selectedBorrowers.length === 0) return;
                            setMergeAnchorEl(e.currentTarget);
                          }}
                        />
                        <TbArrowRight
                          size={20}
                          className={`cursor-pointer ${
                            selectedFiles.length > 0
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                          onClick={(e) => {
                            if (selectedFiles.length === 0) return;
                            setMoveAnchorEl(e.currentTarget);
                          }}
                        />
                        <CloseIcon
                          className="text-red-500 cursor-pointer"
                          fontSize="small"
                          onClick={() => {
                            setSelectMode(false);
                            setSelectedBorrowers([]);
                            setSelectedFiles([]);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          className="text-sm text-blue-600 hover:underline"
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
                          className="text-sm text-gray-600 hover:text-blue-600"
                          onClick={() => setSelectMode(true)}
                        >
                          Select
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Borrowers */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  <ul className="space-y-2">
                    {borrowers.map((name) => {
                      const categories = Object.keys(currentData[name] || {});
                      const isEditing =
                        activeTab === "modified" && editingBorrower === name;

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
                            {/* Only show edit/delete in modified tab */}
                            {activeTab === "modified" && !selectMode && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEditing ? (
                                  <SaveIcon
                                    fontSize="small"
                                    className="text-green-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenameBorrower(name, editingName);
                                    }}
                                  />
                                ) : (
                                  <EditIcon
                                    fontSize="small"
                                    className="text-gray-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingBorrower(name);
                                      setEditingName(name);
                                    }}
                                  />
                                )}
                                <DeleteIcon
                                  fontSize="small"
                                  className="text-red-500 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal(name);
                                  }}
                                />
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
                                            onClick={(e) => e.stopPropagation()}
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

              {/* Right Panel */}
              <div className="w-[75%] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedBorrower && selectedCategory ? (
                    <LoanPackagePanel
                      borrower={selectedBorrower}
                      category={selectedCategory}
                      docs={
                        currentData[selectedBorrower][selectedCategory] || []
                      }
                    />
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center h-full">
                      Select a category to view documents
                    </div>
                  )}
                </div>
              </div>
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

      {/* Add Borrower */}
      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
          from_name={addBorrower.from || ""}
          to_name={addBorrower.to || ""}
        />
      )}

      {/* Merge */}
      {mergeModal && (
        <ConfirmMergeModal
          borrowers={selectedBorrowers}
          target={mergeModal.target}
          onCancel={() => setMergeModal(null)}
          onConfirm={() => handleMerge(mergeModal.target)}
        />
      )}

      {/* Move */}
      {moveModal && (
        <ConfirmMoveModal
          fromBorrower={moveModal.from}
          toBorrower={moveModal.to}
          files={moveModal.files}
          onCancel={() => setMoveModal(null)}
          onConfirm={() => {
            handleMove(moveModal.to);
            setMoveModal(null);
          }}
        />
      )}

      {/* Merge Dropdown */}
      <Menu
        anchorEl={mergeAnchorEl}
        open={Boolean(mergeAnchorEl)}
        onClose={() => setMergeAnchorEl(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Merge selected into...
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

      {/* Delete Borrower */}
      {deleteModal && (
        <ConfirmDeleteModal
          borrower={deleteModal}
          onCancel={() => setDeleteModal(null)}
          onConfirm={(b) => handleDeleteBorrower(b)}
        />
      )}
    </>
  );
};

export default React.memo(LoanExtraction);
