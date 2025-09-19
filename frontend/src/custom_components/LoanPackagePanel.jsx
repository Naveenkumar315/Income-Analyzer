import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

export default function LoanPackagePanel({ borrower, borrowerDocs }) {
  const [openCategories, setOpenCategories] = useState({});

  if (!borrowerDocs) return null;

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Borrower Header */}
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2">
        {borrower}
      </h2>

      {Object.entries(borrowerDocs).map(([category, docs]) => (
        <div
          key={category}
          className="border border-gray-200 rounded-lg shadow-sm bg-white"
        >
          {/* Dropdown Header */}
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded-t-lg"
            onClick={() => toggleCategory(category)}
          >
            <span className="font-semibold text-gray-700">{category}</span>
            {openCategories[category] ? (
              <ExpandLessIcon className="text-gray-600" />
            ) : (
              <ExpandMoreIcon className="text-gray-600" />
            )}
          </div>

          {/* Collapsible Body */}
          {openCategories[category] && (
            <div className="p-3 space-y-3">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Document header */}
                  {/* <div className="flex items-center gap-3 font-medium p-2 bg-gray-50">
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
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
