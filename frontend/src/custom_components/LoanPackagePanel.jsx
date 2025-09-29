import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";
import Checkbox from "@mui/material/Checkbox";

const LoanPackagePanel = ({
  borrower,
  category,
  docs,
  fileSelectMode = false,
  onFileSelect = () => {},
}) => {
  const [openDocs, setOpenDocs] = useState({});

  useEffect(() => {
    if (Array.isArray(docs) && docs.length > 0) {
      setOpenDocs({ 0: true });
    } else {
      setOpenDocs({});
    }
  }, [category, docs]);

  const toggleDoc = (idx) => {
    setOpenDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  function formatCategory(cat = "") {
    return cat
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const formatDocTitle = (doc) => {
    const t =
      (typeof doc === "string" && doc) ||
      doc?.Title ||
      doc?.title ||
      doc?.fileName ||
      doc?.file_name ||
      doc?.name ||
      "";
    let s = String(t).split("~")[0];
    s = s.replace(/\.(pdf|png|jpg|jpeg)$/i, "");
    s = s.replace(/[_-]+/g, " ").trim();
    if (s.length > 70) {
      const parts = s.split(" ");
      s = parts.slice(-3).join(" ");
    }
    return s || "Document";
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

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2 shrink-0">
        {borrower} / {formatCategory(category)}
      </h2>

      <div className="flex-1 overflow-auto flex flex-col gap-4">
        {docs.map((doc, idx) => {
          const fieldEntries = Object.entries(doc || {}).filter(
            ([field]) =>
              !["Title", "Url", "StageName", "GeneratedOn"].includes(field)
          );
          const fieldCount = fieldEntries.length;

          return (
            <div
              key={idx}
              className="border border-gray-300 rounded-md bg-white shadow-sm"
            >
              {/* Dropdown header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer rounded-t-md hover:bg-gray-100"
                onClick={() => toggleDoc(idx)}
              >
                <div className="flex items-center gap-2">
                  {fileSelectMode && (
                    <Checkbox
                      size="small"
                      onChange={(e) => {
                        if (e.target.checked) {
                          onFileSelect((prev) => [
                            ...prev,
                            { borrower, category, index: idx },
                          ]);
                        } else {
                          onFileSelect((prev) =>
                            prev.filter(
                              (f) =>
                                !(
                                  f.borrower === borrower &&
                                  f.category === category &&
                                  f.index === idx
                                )
                            )
                          );
                        }
                      }}
                    />
                  )}
                  <DescriptionIcon className="text-sky-600" />
                  <span className="font-semibold text-gray-800">
                    {/* {formatDocTitle(doc)} */}
                    {category} - {idx + 1}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {fieldCount} Fields Extracted
                  </span>
                </div>
                {openDocs[idx] ? (
                  <ExpandLessIcon className="text-gray-600" />
                ) : (
                  <ExpandMoreIcon className="text-gray-600" />
                )}
              </div>

              {/* Dropdown body */}
              {openDocs[idx] && (
                <div className="p-4">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 font-semibold border-b w-1/3">
                          Fields
                        </th>
                        <th className="p-2 font-semibold border-b">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fieldEntries.map(([field, value]) => (
                        <tr
                          key={field}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-2 font-medium text-gray-700">
                            {field}
                          </td>
                          <td className="p-2 text-gray-600">{String(value)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="p-2 font-medium">Document</td>
                        <td className="p-2">
                          <a
                            href={doc?.Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-500 hover:underline flex items-center gap-1"
                          >
                            <DescriptionIcon fontSize="small" />
                            View PDF
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default React.memo(LoanPackagePanel);
