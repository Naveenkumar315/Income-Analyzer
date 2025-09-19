import { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

export default function LoanPackagePanel({ borrower, category, docs }) {
  const [openDocs, setOpenDocs] = useState({});

  useEffect(() => {
    if (docs && docs.length > 0) {
      // Auto-expand first doc when category changes
      setOpenDocs({ 0: true });
    }
  }, [category, docs]);

  if (!docs) return null;

  const toggleDoc = (idx) => {
    setOpenDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Borrower & Category Header */}
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2">
        {borrower} / {category}
      </h2>

      {docs.map((doc, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-lg shadow-sm bg-white"
        >
          {/* Dropdown Header per doc */}
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded-t-lg"
            onClick={() => toggleDoc(idx)}
          >
            <span className="font-semibold text-gray-700 capitalize">
              {category} - {idx + 1}
            </span>
            {openDocs[idx] ? (
              <ExpandLessIcon className="text-gray-600" />
            ) : (
              <ExpandMoreIcon className="text-gray-600" />
            )}
          </div>

          {/* Collapsible Body */}
          {openDocs[idx] && (
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {/* Document header */}
              {/* <div className="flex items-center gap-3 font-medium p-2 bg-gray-50 border-b sticky top-0 z-10">
                <PictureAsPdfIcon className="text-red-500" />
                <span className="text-gray-800">{doc.Title}</span>
                <span className="ml-auto text-sm text-gray-500">
                  {doc.StageName || "Unknown Stage"}
                </span>
              </div> */}

              {/* Document table */}
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
  );
}
