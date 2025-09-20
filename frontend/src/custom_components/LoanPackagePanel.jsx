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

  if (!docs) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Header */}
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2 shrink-0">
        {borrower} / {category}
      </h2>

      {/* Doc List (scroll here, not inside each doc) */}
      <div className="flex-1 overflow-auto flex flex-col gap-4">
        {docs.map((doc, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg shadow-sm bg-white"
          >
            {/* Collapsible header */}
            <div
              className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded-t-lg hover:bg-gray-200"
              onClick={() => toggleDoc(idx)}
            >
              <div className="flex items-center gap-2">
                <DescriptionIcon className="text-sky-600" />
                <span className="font-semibold text-gray-700 truncate">
                  {category} - {idx + 1}
                </span>
              </div>
              {openDocs[idx] ? (
                <ExpandLessIcon className="text-gray-600" />
              ) : (
                <ExpandMoreIcon className="text-gray-600" />
              )}
            </div>

            {/* Collapsible body (no inner scroll) */}
            {openDocs[idx] && (
              <div className="p-3">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {Object.entries(doc).map(([field, value]) => {
                      if (
                        ["Title", "Url", "StageName", "GeneratedOn"].includes(
                          field
                        )
                      )
                        return null;
                      return (
                        <tr
                          key={field}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-2 font-semibold w-1/3">{field}</td>
                          <td className="p-2">{value}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-gray-200">
                      <td className="p-2 font-semibold">Document</td>
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
        ))}
      </div>
    </div>
  );
}
