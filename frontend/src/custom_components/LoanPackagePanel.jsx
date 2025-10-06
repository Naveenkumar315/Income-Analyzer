import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { TbArrowRight } from "react-icons/tb";

const DOCS_PER_PAGE = 5;

const LoanPackagePanel = ({
  borrower,
  category,
  docs,
  borrowersList = [],
  onMoveDocument = () => {},
  isModifiedView = false,
}) => {
  const [activeDoc, setActiveDoc] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState({});
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [docPage, setDocPage] = useState(0);
  const [moveAnchor, setMoveAnchor] = useState(null);
  const [selectedDocIdx, setSelectedDocIdx] = useState(null);

  function formatCategory(cat = "") {
    return cat
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const renderTable = (rows = []) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return <p className="text-gray-400 italic">No data</p>;
    }
    const headers = Object.keys(rows[0] || {});
    return (
      <div className="flex-1 overflow-auto border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-2 border-b font-semibold text-left">
                  {h}
                </th>
              ))}
              {isModifiedView && <th className="p-2 border-b text-left">Move</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {headers.map((h) => (
                  <td key={h} className="p-2 border-b text-gray-700">
                    {String(r?.[h] ?? "")}
                  </td>
                ))}
                {isModifiedView && (
                  <td className="p-2 border-b text-right">
                    <IconButton
                      size="small"
                      title="Move this document"
                      onClick={(e) => {
                        setSelectedDocIdx(i);
                        setMoveAnchor(e.currentTarget);
                      }}
                    >
                      <TbArrowRight className="text-sky-600" />
                    </IconButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = (doc, idx) => {
    if (doc == null) return null;
    const flatFields = Object.entries(doc || {}).filter(
      ([, value]) => !Array.isArray(value)
    );
    return (
      <div className="grid grid-cols-2 gap-3 text-sm relative">
        {flatFields.map(([field, value]) => (
          <div key={field}>
            <span className="font-medium">{field}:</span>{" "}
            <span className="text-gray-700">{String(value ?? "")}</span>
          </div>
        ))}
        {/* Always visible move icon for flat docs */}
        {isModifiedView && (
          <div className="absolute top-0 right-0">
            <IconButton
              size="small"
              title="Move this document"
              onClick={(e) => {
                setSelectedDocIdx(idx);
                setMoveAnchor(e.currentTarget);
              }}
            >
              <TbArrowRight className="text-sky-600" />
            </IconButton>
          </div>
        )}
      </div>
    );
  };

  const renderDoc = (doc, idx) => {
    if (doc == null) {
      return <p className="text-gray-400 italic">No document data</p>;
    }

    const arrayTabs = Object.entries(doc)
      .filter(
        ([, value]) =>
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "object"
      )
      .map(([key]) => key);

    const subTabs = ["Summary", ...arrayTabs];
    const tab = activeSubTab[idx] || "Summary";

    return (
      <div className="flex flex-col h-full space-y-3">
        {/* Sub-tabs */}
        <div className="border-b flex gap-6 text-sm shrink-0">
          {subTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveSubTab((prev) => ({ ...prev, [idx]: t }))}
              className={`pb-2 ${
                tab === t
                  ? "border-b-2 border-sky-600 text-sky-600 font-medium"
                  : "text-gray-600 hover:text-sky-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto pr-1">
          {tab === "Summary" && renderSummary(doc, idx)}
          {arrayTabs.map(
            (key) =>
              tab === key && (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {key}
                  </h3>
                  {renderTable(doc[key])}
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  const totalPages = Math.ceil(docs.length / DOCS_PER_PAGE);
  const canGoLeft = docPage > 0;
  const canGoRight = docPage < totalPages - 1;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-sky-600 border-b pb-2 text-center flex-1">
          {borrower} / {formatCategory(category)}
        </h2>
        <IconButton
          size="small"
          onClick={() => setExpandedDoc(activeDoc)}
          title="Expand"
        >
          <OpenInFullIcon className="text-sky-600" />
        </IconButton>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {docs.length > 0 ? renderDoc(docs[activeDoc], activeDoc) : (
          <p className="text-gray-400 italic text-center">No document data</p>
        )}
      </div>

      {/* Move dropdown for document-level move */}
      <Menu
        anchorEl={moveAnchor}
        open={Boolean(moveAnchor)}
        onClose={() => setMoveAnchor(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move document to
        </div>
        {borrowersList
          .filter((b) => b !== borrower)
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setMoveAnchor(null);
                onMoveDocument(selectedDocIdx, b);
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

export default React.memo(LoanPackagePanel);
