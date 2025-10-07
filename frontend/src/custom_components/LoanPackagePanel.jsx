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
  const [moveAnchor, setMoveAnchor] = useState(null); // category move anchor
  const [docMoveAnchor, setDocMoveAnchor] = useState(null); // per-doc move anchor

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
    if (!doc) {
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
        {/* === Sub-tabs bar with Move icon aligned to the right === */}
        <div className="border-b flex items-center justify-between text-sm shrink-0">
          <div className="flex gap-6">
            {subTabs.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setActiveSubTab((prev) => ({ ...prev, [idx]: t }))
                }
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

          <div className="flex items-center gap-1">
            {/* Per-document move icon (moves the currently activeDoc) */}
            {isModifiedView && (
              <>
                <IconButton
                  size="small"
                  title={`Move this document (${category} ${idx + 1})`}
                  onClick={(e) => setDocMoveAnchor(e.currentTarget)}
                >
                  <TbArrowRight className="text-sky-600" />
                </IconButton>

                {/* Category-level Move icon */}
                {/* <IconButton
                  size="small"
                  title={`Move entire ${category} section`}
                  onClick={(e) => setMoveAnchor(e.currentTarget)}
                >
                  <TbArrowRight className="text-sky-600" />
                </IconButton> */}
              </>
            )}
          </div>
        </div>

        {/* === Tab content === */}
        <div className="flex-1 overflow-auto pr-1">
          {tab === "Summary" && renderSummary(doc)}

          {arrayTabs.map(
            (key) =>
              tab === key && (
                <div key={key} className="relative mb-3">
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

  const totalPages = Math.ceil(docs.length / DOCS_PER_PAGE);
  const canGoLeft = docPage > 0;
  const canGoRight = docPage < totalPages - 1;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* === Header === */}
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

      {/* === Tabs navigation === */}
      <div className="relative flex items-center border-b overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 flex items-center bg-white z-10">
          {canGoLeft && (
            <IconButton onClick={() => setDocPage((p) => Math.max(0, p - 1))}>
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        <div className="flex-1 overflow-hidden px-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${docPage * 100}%)`,
              width: `${Math.max(totalPages, 1) * 100}%`,
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
                      <div key={realIdx} className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDoc(realIdx)}
                          className={`px-3 py-2 text-sm whitespace-nowrap ${
                            activeDoc === realIdx
                              ? "border-b-2 border-sky-600 text-sky-600 font-medium"
                              : "text-gray-600 hover:text-sky-600"
                          }`}
                        >
                          {category} {realIdx + 1}
                        </button>

                        {/* Small per-tab Move icon (optional) */}
                        {/* {isModifiedView && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              // set the active doc and open doc-move menu for that doc
                              setActiveDoc(realIdx);
                              setDocMoveAnchor(e.currentTarget);
                            }}
                            title={`Move ${category} ${realIdx + 1}`}
                          >
                            <TbArrowRight className="text-sky-400" />
                          </IconButton>
                        )} */}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

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

      {/* === Active Document === */}
      <div className="flex-1 overflow-auto p-4">
        {renderDoc(docs[activeDoc], activeDoc)}
      </div>

      {/* === Category Move Menu === */}
      <Menu
        anchorEl={moveAnchor}
        open={Boolean(moveAnchor)}
        onClose={() => setMoveAnchor(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move entire section to
        </div>
        {borrowersList
          .filter((b) => b !== borrower)
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setMoveAnchor(null);
                // category move -> docIndex null
                onMoveDocument(null, b, category);
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>

      {/* === Per-Document Move Menu === */}
      <Menu
        anchorEl={docMoveAnchor}
        open={Boolean(docMoveAnchor)}
        onClose={() => setDocMoveAnchor(null)}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move this document to
        </div>
        {borrowersList
          .filter((b) => b !== borrower)
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setDocMoveAnchor(null);
                // pass the activeDoc index to parent
                onMoveDocument(activeDoc, b, null);
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>

      {/* === Expand Modal === */}
      <Dialog
        open={expandedDoc !== null}
        onClose={() => setExpandedDoc(null)}
        PaperProps={{
          sx: {
            margin: "40px",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            width: "80vw",
            height: "80vh",
          },
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <DialogTitle className="!p-0 text-lg font-semibold text-sky-700">
            {borrower} / {formatCategory(category)} -{" "}
            {expandedDoc !== null ? expandedDoc + 1 : ""}
          </DialogTitle>
          <IconButton onClick={() => setExpandedDoc(null)}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent sx={{ flex: 1 }}>
          {expandedDoc !== null && renderDoc(docs[expandedDoc], expandedDoc)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(LoanPackagePanel);
