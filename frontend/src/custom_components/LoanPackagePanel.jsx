import React, { useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const LoanPackagePanel = ({ menuItems, selected, setSelected, documents }) => {




    return (
        <div className="flex border-t border-gray-300 max-h-[calc(100vh-80px)] mt-5">
            {/* Sidebar */}
            <div className="w-[30%] border-r border-gray-300 p-2 overflow-y-auto">
                <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item}
                            onClick={() => setSelected(item)}
                            className={`p-2 cursor-pointer border-b hover:bg-gray-50
                ${item === selected
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
                        <Accordion key={idx} className="!shadow-sm !border !border-gray-200">
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${idx}-content`}
                                id={`panel-${idx}-header`}
                                className="!bg-gray-100 !rounded-t-lg"
                            >
                                <Typography component="span" className="font-medium text-gray-800">
                                    {doc.title}
                                </Typography>
                                <Typography component="span" className="pl-6 text-sm text-gray-500">
                                    {doc.fieldCount} Fields Extracted
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <table className="w-full text-left text-sm">
                                    <tbody>
                                        <tr className="border-t bg-gray-100 border-gray-200">
                                            <td className="p-2 font-semibold">Fields</td>
                                            <td className="p-2 font-semibold">Value</td>
                                        </tr>
                                        {doc.fields.map((field, i) => (
                                            <tr key={i} className="border-t border-gray-200">
                                                <td className="p-2 font-semibold">{field.label}</td>
                                                <td className="p-2">{field.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LoanPackagePanel