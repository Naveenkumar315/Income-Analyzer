import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import api from "../api/client";

const LoanExtraction = ({
  showSection = {},
  setShowSection = () => {},
  goBack,
}) => {
  const { isUploaded, normalized_json, set_normalized_json } = useUpload();

  // UI & data state
  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setRawData] = useState(normalized_json || {});
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [openCategories, setOpenCategories] = useState({});
  const [addBorrower, setAddBorrower] = useState({ model: false });

  // Merge states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // set rawData when upload context changes
  useEffect(() => {
    try {
      setRawData(normalized_json || {});
    } catch (err) {
      console.error("Error setting rawData:", err);
    }
  }, [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  // initial select first borrower/category
  useEffect(() => {
    try {
      if (borrowers.length > 0 && !selectedBorrower) {
        const firstBorrower = borrowers[0];
        const categories = Object.keys(rawData[firstBorrower] || {});
        setSelectedBorrower(firstBorrower);
        if (categories.length > 0) setSelectedCategory(categories[0]);
        setOpenBorrowers({ [firstBorrower]: true });
      }
    } catch (err) {
      console.error("Error initializing borrower selection:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrowers, rawData]);

  const toggleBorrower = (name) => {
    try {
      setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));
    } catch (err) {
      console.error("Error toggling borrower:", err);
    }
  };

  const toggleCategory = (borrower, category) => {
    try {
      const key = `${borrower}_${category}`;
      setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    } catch (err) {
      console.error("Error toggling category:", err);
    }
  };

  const HandleProcess = () => {
    try {
      setShowSection((prev) => ({
        ...prev,
        processLoanSection: false,
        provideLoanIDSection: false,
        extractedSection: false,
        uploadedModel: false,
        startAnalyzing: true,
      }));
    } catch (err) {
      console.error("Error handling process:", err);
    }
  };

  function formatDocTitle(doc = "") {
    try {
      const title =
        (typeof doc === "string" && doc) ||
        doc?.Title ||
        doc?.title ||
        doc?.fileName ||
        doc?.file_name ||
        doc?.name ||
        "";

      let s = String(title || "");
      s = s.split("~")[0];
      s = s.replace(/\.(pdf|png|jpg|jpeg|tiff)$/i, "");
      s = s.replace(/[_-]+/g, " ");
      s = s.replace(/\s{2,}/g, " ");
      s = s.replace(/\b\d+\b.*$/g, "");
      s = s.trim();
      if (s.length > 60) {
        const parts = s.split(" ");
        s = parts.slice(-3).join(" ");
      }
      return s || "";
    } catch (err) {
      console.error("Error formatting document title:", err);
      return "";
    }
  }

  const handleMerge = async (targetBorrower, newName) => {
    try {
      if (!selectedBase || !targetBorrower) return;

      const email = sessionStorage.getItem("email");
      const loanID = sessionStorage.getItem("loanId");
      const username = sessionStorage.getItem("username") || "User";

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
        username,
        email,
        loanID,
        file_name: "merge_update",
        raw_json: mergedData,
      });

      set_normalized_json(res.data.cleaned_json);
      setSelectMode(false);
      setSelectedBase(null);
    } catch (err) {
      console.error("Error merging borrowers:", err);
    }
  };

  return (
    <>
      <BackLink onClick={goBack} />

      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 shrink-0">
          <span className="font-medium">
            Upload & Extract Files {sessionStorage.getItem("loanId") || ""}
          </span>
          {isUploaded?.uploaded && (
            <div className="flex gap-2">
              <Button
                variant="upload-doc"
                width={200}
                label="Upload Documents"
                onClick={() =>
                  setShowSection((prev) => ({ ...prev, uploadedModel: true }))
                }
              />
              <Button
                variant="start-analyze"
                width={200}
                label="Start Analyzing"
                onClick={HandleProcess}
              />
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="flex flex-1 min-h-0 border-t border-gray-300">
          {isUploaded?.uploaded ? (
            <>
              {/* Borrower + categories */}
              <div className="w-[25%] border-r border-gray-300 p-2 overflow-auto">
                <div className="font-semibold mb-2 text-[#26a3dd] flex justify-between items-center">
                  <span>Loan Package</span>
                  {selectMode ? (
                    <div className="flex items-center gap-3">
                      <TbArrowMerge
                        className="text-blue-500 cursor-pointer"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                      />
                      <CloseIcon
                        className="text-red-400 cursor-pointer"
                        onClick={() => {
                          setSelectMode(false);
                          setSelectedBase(null);
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

                {/* borrower tree */}
                <ul>
                  {borrowers.map((name) => {
                    const categories = Object.keys(rawData[name] || {});
                    return (
                      <li key={name} className="mb-2">
                        <div
                          className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 ${
                            name === selectedBorrower
                              ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
                              : "border-gray-200"
                          }`}
                          onClick={() => toggleBorrower(name)}
                        >
                          <div className="flex items-center gap-2">
                            {selectMode && (
                              <Checkbox
                                size="small"
                                checked={selectedBase === name}
                                onChange={() =>
                                  setSelectedBase((prev) =>
                                    prev === name ? null : name
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <PersonSharpIcon fontSize="small" />
                            <span className="capitalize">{name}</span>
                          </div>
                          {openBorrowers[name] ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </div>

                        {openBorrowers[name] && (
                          <ul className="ml-6 mt-1">
                            {categories.length === 0 && (
                              <li className="text-xs text-gray-400 italic ml-2">
                                No categories
                              </li>
                            )}
                            {categories.map((cat) => {
                              const docs = rawData[name]?.[cat] ?? [];
                              const docCount = Array.isArray(docs)
                                ? docs.length
                                : 0;
                              const categoryKey = `${name}_${cat}`;
                              return (
                                <li key={cat} className="mb-1">
                                  <div
                                    onClick={() => {
                                      toggleCategory(name, cat);
                                      setSelectedBorrower(name);
                                      setSelectedCategory(cat);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                      name === selectedBorrower &&
                                      cat === selectedCategory
                                        ? "bg-blue-100 text-blue-600 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {name === selectedBorrower &&
                                    cat === selectedCategory ? (
                                      <FaFolderOpen className="text-blue-500" />
                                    ) : (
                                      <FaFolder className="text-gray-500" />
                                    )}
                                    <span className="truncate">{cat}</span>
                                    <span className="ml-auto text-xs text-gray-500">
                                      ({docCount})
                                    </span>
                                  </div>

                                  <ul className="ml-6 mt-1">
                                    {Array.isArray(docs) && docs.length > 0 ? (
                                      docs.map((doc, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-600 py-0.5 truncate"
                                          title={doc?.Title || doc?.title || ""}
                                        >
                                          {formatDocTitle(doc)}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-xs text-gray-400 italic">
                                        No documents
                                      </li>
                                    )}
                                  </ul>
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

              {/* Right document panel */}
              <div className="w-[75%] p-4 overflow-auto">
                {selectedBorrower && selectedCategory ? (
                  <LoanPackagePanel
                    borrower={selectedBorrower}
                    category={selectedCategory}
                    docs={
                      Array.isArray(
                        rawData?.[selectedBorrower]?.[selectedCategory]
                      )
                        ? rawData[selectedBorrower][selectedCategory]
                        : []
                    }
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

        {/* floating button */}
        <div className="fixed bottom-4 right-4 w-[50px] h-[50px] rounded-3xl bg-[#12699D] shadow-lg flex items-center justify-center cursor-pointer">
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

      {/* Enter borrower modal */}
      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
          from_name={addBorrower.from || ""}
          to_name={addBorrower.to || ""}
        />
      )}

      {/* Merge dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {borrowers
          .filter((b) => b !== selectedBase)
          .map((b) => (
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
            >
              {b}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default LoanExtraction;
