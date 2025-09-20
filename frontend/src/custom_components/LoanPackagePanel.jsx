import { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";

export default function LoanPackagePanel({ borrower, category, docs }) {
  const [openDocs, setOpenDocs] = useState({});

  useEffect(() => {
    if (docs && docs.length > 0) {
      setOpenDocs({ 0: true }); // Auto-expand first doc
    }
  }, [category, docs]);

  const toggleDoc = (idx) => {
    setOpenDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  function formatCategory(cat = "") {
    return cat
      .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
      .replace(/[_-]/g, " ") // replace _ and - with space
      .replace(/\s+/g, " ") // collapse spaces
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
  }

  if (!docs) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2 shrink-0">
        {borrower} / {category}
      </h2>

      <div className="flex-1 overflow-auto flex flex-col gap-4">
        {docs.map((doc, idx) => {
          // Filter fields (exclude metadata like Title/Url)
          const fieldEntries = Object.entries(doc).filter(
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
                  <DescriptionIcon className="text-sky-600" />
                  {/* <span className="font-semibold text-gray-800">
                    {doc.Title || `${category}_${idx + 1}`}
                  </span> */}
                  <span className="font-semibold text-gray-800">
                    {formatCategory(category)}
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
                          <td className="p-2 text-gray-600">{value}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="p-2 font-medium">Document</td>
                        <td className="p-2">
                          <a
                            href={doc.Url}
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
}
