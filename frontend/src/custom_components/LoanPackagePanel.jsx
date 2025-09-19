import React, { useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const LoanPackagePanel = ({
  menuItems,
  documents,
  setSelectedCategory,
  selectedCategory,
}) => {
  debugger;
  return (
    <div className="flex border-t border-gray-300 max-h-[calc(100vh-80px)] mt-5">
      {/* Sidebar */}
      <div className="w-[30%] border-r border-gray-300 p-2 overflow-y-auto">
        <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`p-2 cursor-pointer border-b hover:bg-gray-50
                                    ${
                                      item === selectedCategory
                                        ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
                                        : "border-gray-200"
                                    }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="w-[70%] p-2 space-y-3">
        <div className="space-y-4 h-[400px] overflow-y-auto">
          {documents.map((doc, idx) => (
            <Accordion
              key={idx}
              className="!shadow-sm !border !border-gray-200"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${idx}-content`}
                id={`panel-${idx}-header`}
                className="!bg-gray-100 !rounded-t-lg"
              >
                <Typography
                  component="span"
                  className="font-medium text-gray-800"
                >
                  {doc.Title || "Untitled Doc"}
                </Typography>
                <Typography
                  component="span"
                  className="pl-6 text-sm text-gray-500"
                >
                  Borrower: {doc.borrower}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {Object.entries(doc).map(([label, value]) =>
                      ["borrower", "Title", "Url"].includes(label) ? null : (
                        <tr key={label} className="border-t border-gray-200">
                          <td className="p-2 font-semibold">{label}</td>
                          <td className="p-2">{String(value)}</td>
                        </tr>
                      )
                    )}
                    <tr>
                      <td className="p-2 font-semibold">Document Link</td>
                      <td className="p-2">
                        <a
                          href={doc.Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View PDF
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanPackagePanel;
