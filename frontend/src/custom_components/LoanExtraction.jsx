import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";
import { useUpload } from "../context/UploadContext";
import LoanPackagePanel from "./LoanPackagePanel";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { FaFolder, FaFolderOpen } from "react-icons/fa";
import BackLink from "./BackLink";
import EnterBorrowerName from "./EnterBorrowerName";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { TbArrowMerge } from "react-icons/tb";
import { TbArrowRight } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api/client";
import ConfirmMoveModal from "./ConfirmMoveModal";

import { toast } from "react-toastify";

const LoanExatraction = ({
  showSection = {},
  setShowSection = () => {},
  goBack,
}) => {
  const { isUploaded, normalized_json } = useUpload();

  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setRawData] = useState(normalized_json || {});
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [addBorrower, setAddBorrower] = useState({
    model: false,
    borrowerName: "",
  });

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null); // borrower selection
  const [selectedFiles, setSelectedFiles] = useState([]); // category-level selections
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  useEffect(() => setRawData(normalized_json || {}), [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

  // Folder merge
  const handleMerge = async (targetBorrower, newName) => {
    if (!selectedBase) return;

    try {
      const mergedData = JSON.parse(JSON.stringify(rawData));
      const baseCats = mergedData[selectedBase] || {};
      const targetCats = mergedData[targetBorrower] || {};
      const unionCats = { ...baseCats };

      Object.keys(targetCats).forEach((cat) => {
        if (!Array.isArray(unionCats[cat])) unionCats[cat] = [];
        unionCats[cat] = unionCats[cat].concat(targetCats[cat]);
      });

      delete mergedData[selectedBase];
      delete mergedData[targetBorrower];
      mergedData[newName] = unionCats;

      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: "folder_merge",
        raw_json: mergedData || {},
      });

      setRawData(res.data.cleaned_json);
      setSelectMode(false);
      setSelectedBase(null);

      toast.success(
        `Borrowers ${selectedBase} and ${targetBorrower} merged into ${newName}`
      );
    } catch (err) {
      console.error("Error in handleMerge:", err);
      toast.error("Failed to merge borrowers. Please try again.");
    }
  };

  //  File (category) move
  const handleMove = async (toBorrower) => {
    if (!selectedFiles.length) return;

    try {
      const mergedData = JSON.parse(JSON.stringify(rawData));

      selectedFiles.forEach(({ borrower, category }) => {
        const docs = mergedData[borrower][category] || [];
        if (!mergedData[toBorrower][category])
          mergedData[toBorrower][category] = [];
        mergedData[toBorrower][category] =
          mergedData[toBorrower][category].concat(docs);
        mergedData[borrower][category] = [];
      });

      // cleanup empty categories
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

      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: "file_merge",
        raw_json: mergedData || {},
      });

      setRawData(res.data.cleaned_json);
      setSelectMode(false);
      setSelectedFiles([]);

      toast.success(`Moved ${selectedFiles.length} file(s) to ${toBorrower}`);
    } catch (err) {
      console.error("Error in handleMove:", err);
      toast.error("Failed to move files. Please try again.");
    }
  };

  return (
    <>
      {/* <BackLink onClick={goBack} /> */}

      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 shrink-0">
          <div className="font-medium flex gap-5">
            <BackLink onClick={goBack} />
            Upload & Extract Files {sessionStorage.getItem("loanId") || ""}
          </div>
          {isUploaded?.uploaded && (
            <div className="flex gap-2">
              <Button
                variant="upload-doc"
                width={200}
                label="Upload Documents"
                onClick={() =>
                  setShowSection((p) => ({ ...p, uploadedModel: true }))
                }
              />
              <Button
                variant="start-analyze"
                width={200}
                label="Start Analyzing"
                onClick={() =>
                  setShowSection((p) => ({ ...p, startAnalyzing: true }))
                }
              />
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex flex-1 min-h-0 border-t border-gray-300">
          {isUploaded?.uploaded ? (
            <>
              {/* Left Borrower Tree */}
              <div className="w-[25%] border-r border-gray-300 p-2 overflow-auto">
                <div className="font-semibold mb-2 text-[#26a3dd] flex justify-between items-center">
                  <span>Loan Package</span>
                  {selectMode ? (
                    <div className="flex items-center gap-3">
                      {/* Merge: only active if borrower selected and no files */}
                      <TbArrowMerge
                        className={`cursor-pointer ${
                          selectedBase && selectedFiles.length === 0
                            ? "text-blue-500"
                            : "text-gray-300"
                        }`}
                        onClick={(e) =>
                          selectedBase &&
                          selectedFiles.length === 0 &&
                          setAnchorEl(e.currentTarget)
                        }
                      />
                      {/* Move: only active if files selected and no borrower */}
                      <TbArrowRight
                        className={`cursor-pointer ${
                          selectedFiles.length > 0 && !selectedBase
                            ? "text-blue-500"
                            : "text-gray-300"
                        }`}
                        onClick={(e) =>
                          selectedFiles.length > 0 &&
                          !selectedBase &&
                          setMoveAnchorEl(e.currentTarget)
                        }
                      />
                      <CloseIcon
                        className="text-red-400 cursor-pointer"
                        onClick={() => {
                          setSelectMode(false);
                          setSelectedBase(null);
                          setSelectedFiles([]);
                        }}
                      />
                    </div>
                  ) : (
                    <p
                      className="cursor-pointer"
                      onClick={() => setSelectMode(true)}
                    >
                      Select
                    </p>
                  )}
                </div>

                <ul>
                  {borrowers.map((name) => {
                    const categories = Object.keys(rawData[name] || {});
                    return (
                      <li key={name} className="mb-2">
                        <div
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleBorrower(name)}
                        >
                          <div className="flex items-center gap-2">
                            {selectMode && (
                              <Checkbox
                                size="small"
                                checked={selectedBase === name}
                                onChange={() => {
                                  // selecting borrower clears file selections
                                  setSelectedFiles([]);
                                  setSelectedBase(name);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <PersonSharpIcon fontSize="small" />
                            <span>{name}</span>
                          </div>
                          {openBorrowers[name] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </div>

                        {/* Categories */}
                        {openBorrowers[name] && (
                          <ul className="ml-6 mt-1">
                            {categories.map((cat) => {
                              const docs = rawData[name][cat] || [];
                              const isSelected = selectedFiles.some(
                                (f) => f.borrower === name && f.category === cat
                              );
                              return (
                                <li key={cat} className="mb-1">
                                  <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedBorrower(name);
                                      setSelectedCategory(cat);
                                    }}
                                  >
                                    {selectMode && (
                                      <Checkbox
                                        size="small"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          // selecting a category clears borrower selection
                                          setSelectedBase(null);
                                          if (e.target.checked) {
                                            setSelectedFiles((prev) => [
                                              ...prev,
                                              { borrower: name, category: cat },
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
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    {name === selectedBorrower &&
                                    cat === selectedCategory ? (
                                      <FaFolderOpen className="text-blue-500" />
                                    ) : (
                                      <FaFolder className="text-gray-500" />
                                    )}
                                    <span className="truncate">{cat}</span>
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

              {/* Right Panel */}
              <div className="w-[75%] p-4 overflow-auto">
                {selectedBorrower && selectedCategory ? (
                  <LoanPackagePanel
                    borrower={selectedBorrower}
                    category={selectedCategory}
                    docs={rawData[selectedBorrower][selectedCategory] || []}
                  />
                ) : (
                  <div className="text-gray-400 flex items-center justify-center h-full">
                    Select a category to view documents
                  </div>
                )}
              </div>
            </>
          ) : (
            <UnuploadedScreen setShowSection={setShowSection} />
          )}
        </div>

        {/* Rules Button */}
        <div className="fixed bottom-4 right-4 w-[50px] h-[50px] bg-[#12699D] rounded-full flex items-center justify-center">
          <DescriptionIcon
            onClick={() => setRulesModel(true)}
            className="text-white"
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

      {/* Merge Modal */}
      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
          from_name={addBorrower.from || ""}
          to_name={addBorrower.to || ""}
        />
      )}

      {/* Confirm Move */}
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: "8px",
            padding: "4px 0",
          },
        }}
      >
        {/* Title */}
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Merge borrower with
        </div>

        {/* Borrower list */}
        {borrowers
          .filter((b) => b !== selectedBase)
          .map((b, idx, arr) => (
            <MenuItem
              key={b}
              onClick={() => {
                setAnchorEl(null);
                setAddBorrower({
                  model: true,
                  from: selectedBase,
                  to: b,
                  onSave: (newName) => handleMerge(b, newName),
                });
              }}
              className="text-sm text-gray-700 hover:bg-blue-50"
              sx={{ paddingY: 1.2, paddingX: 2 }}
            >
              {b}
              {/* Divider between items, not after last */}
              {idx < arr.length - 1 && (
                <hr className="absolute bottom-0 left-0 right-0 border-gray-100" />
              )}
            </MenuItem>
          ))}
      </Menu>

      {/* Move Dropdown */}
      <Menu
        anchorEl={moveAnchorEl}
        open={Boolean(moveAnchorEl)}
        onClose={() => setMoveAnchorEl(null)}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: "8px",
            padding: "4px 0",
          },
        }}
      >
        {/* Title */}
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move files to
        </div>

        {/* Borrower list */}
        {borrowers
          .filter((b) => !selectedFiles.some((f) => f.borrower === b))
          .map((b, idx, arr) => (
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
              className="text-sm text-gray-700 hover:bg-blue-50"
              sx={{ paddingY: 1.2, paddingX: 2 }}
            >
              {b}
              {/* Divider between items, not after last */}
              {idx < arr.length - 1 && (
                <hr className="absolute bottom-0 left-0 right-0 border-gray-100" />
              )}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default React.memo(LoanExatraction);
