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
  const [openSubsections, setOpenSubsections] = useState({}); // for arrays inside

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

  const toggleSubsection = (docIdx, field) => {
    const key = `${docIdx}-${field}`;
    setOpenSubsections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  function formatCategory(cat = "") {
    return cat
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

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

          return (
            <div
              key={idx}
              className="border border-gray-300 rounded-md bg-white shadow-sm"
            >
              {/* Main dropdown header */}
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
                    {category} - {idx + 1}
                  </span>
                </div>
                {openDocs[idx] ? (
                  <ExpandLessIcon className="text-gray-600" />
                ) : (
                  <ExpandMoreIcon className="text-gray-600" />
                )}
              </div>

              {/* Main dropdown body */}
              {openDocs[idx] && (
                <div className="p-4 space-y-4">
                  {fieldEntries.map(([field, value]) => {
                    // If value is array of objects -> make nested dropdown
                    if (
                      Array.isArray(value) &&
                      value.length > 0 &&
                      typeof value[0] === "object"
                    ) {
                      const key = `${idx}-${field}`;
                      const isOpen = openSubsections[key];
                      return (
                        <div
                          key={field}
                          className="border rounded-md overflow-hidden"
                        >
                          <div
                            className="flex justify-between items-center px-3 py-2 bg-gray-100 cursor-pointer"
                            onClick={() => toggleSubsection(idx, field)}
                          >
                            <span className="font-medium text-gray-700">
                              {field} ({value.length})
                            </span>
                            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </div>
                          {isOpen && (
                            <div className="p-2">
                              {value.map((row, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="mb-4 border rounded-md overflow-hidden"
                                >
                                  <div className="bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-600">
                                    {field} - Record {rIdx + 1}
                                  </div>
                                  <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="p-2 font-semibold border-b w-1/3">
                                          Field
                                        </th>
                                        <th className="p-2 font-semibold border-b">
                                          Value
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(row).map(([k, v]) => (
                                        <tr
                                          key={k}
                                          className="border-b last:border-0 hover:bg-gray-50"
                                        >
                                          <td className="p-2 font-medium text-gray-700">
                                            {k}
                                          </td>
                                          <td className="p-2 text-gray-600">
                                            {String(v)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Default simple field
                    return (
                      <div key={field} className="flex border-b py-1">
                        <div className="w-1/3 font-medium text-gray-700">
                          {field}
                        </div>
                        <div className="flex-1 text-gray-600">
                          {String(value)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Document link (if available) */}
                  {doc?.Url && (
                    <div className="mt-2">
                      <a
                        href={doc?.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:underline flex items-center gap-1"
                      >
                        <DescriptionIcon fontSize="small" />
                        View PDF
                      </a>
                    </div>
                  )}
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
