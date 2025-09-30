import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const DOCS_PER_PAGE = 5;

const LoanPackagePanel = ({ borrower, category, docs }) => {
  const [activeDoc, setActiveDoc] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState({});
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [docPage, setDocPage] = useState(0); // pagination state

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = (doc) => {
    if (doc == null) return null;
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        {Object.entries(doc || {}).map(([field, value]) => {
          if (Array.isArray(value)) return null;
          return (
            <div key={field}>
              <span className="font-medium">{field}:</span>{" "}
              <span className="text-gray-700">{String(value ?? "")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDoc = (doc, idx) => {
    if (doc == null) {
      return <p className="text-gray-400 italic">No document data</p>;
    }

    // build dynamic sub-tabs
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
        {/* Dynamic Sub-tabs */}
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

        {/* Tab content */}
        <div className="flex-1 overflow-auto pr-1">
          {tab === "Summary" && renderSummary(doc)}

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

  if (!Array.isArray(docs) || docs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <h2 className="text-xl font-bold text-sky-600 border-b pb-2">
          {borrower} / {formatCategory(category)}
        </h2>
        <p>No documents found</p>
      </div>
    );
  }

  // pagination for document tabs
  const totalPages = Math.ceil(docs.length / DOCS_PER_PAGE);
  const canGoLeft = docPage > 0;
  const canGoRight = docPage < totalPages - 1;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Title + Expand */}
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

      {/* Document Tabs with smooth transition */}
      <div className="relative flex items-center border-b overflow-hidden">
        {/* Left arrow fixed */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center bg-white z-10">
          {canGoLeft && (
            <IconButton onClick={() => setDocPage((p) => Math.max(0, p - 1))}>
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        {/* Tabs container with padding to avoid overlap */}
        <div className="flex-1 overflow-hidden px-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${docPage * 100}%)`,
              width: `${totalPages * 100}%`,
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const sliceStart = pageIdx * DOCS_PER_PAGE;
              const pageDocs = docs.slice(
                sliceStart,
                sliceStart + DOCS_PER_PAGE
              );
              return (
                <div
                  key={pageIdx}
                  className="flex gap-4 justify-start flex-shrink-0 w-full"
                >
                  {pageDocs.map((_, idx) => {
                    const realIdx = sliceStart + idx;
                    return (
                      <button
                        key={realIdx}
                        onClick={() => setActiveDoc(realIdx)}
                        className={`px-3 py-2 text-sm whitespace-nowrap ${
                          activeDoc === realIdx
                            ? "border-b-2 border-sky-600 text-sky-600 font-medium"
                            : "text-gray-600 hover:text-sky-600"
                        }`}
                      >
                        {category} {realIdx + 1}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right arrow fixed */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-white z-10">
          {canGoRight && (
            <IconButton
              onClick={() => setDocPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Active Document */}
      <div className="flex-1 overflow-auto p-4">
        {renderDoc(docs[activeDoc], activeDoc)}
      </div>

      {/* Floating Expand Modal */}
      <Dialog
        open={expandedDoc !== null}
        onClose={() => setExpandedDoc(null)}
        fullScreen={false}
        PaperProps={{
          sx: {
            margin: "40px",
            borderRadius: "16px",
            overflow: "hidden",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            width: "80vw",
            maxWidth: "80vw",
            height: "80vh",
            maxHeight: "80vh",
          },
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <DialogTitle className="!p-0 text-lg font-semibold text-sky-700">
            {borrower} / {formatCategory(category)} -{" "}
            {expandedDoc !== null ? expandedDoc + 1 : ""}
          </DialogTitle>
          <IconButton onClick={() => setExpandedDoc(null)}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Content */}
        <DialogContent
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {expandedDoc !== null && renderDoc(docs[expandedDoc], expandedDoc)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(LoanPackagePanel);
