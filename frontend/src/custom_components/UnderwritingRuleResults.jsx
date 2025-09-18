import { useState } from "react";
import ResultTab from "./ResultTab";
import Button from "../components/Button";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from '@mui/icons-material/Error';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";

const Tabs = ["Rule Results", "Summary", "Insights"]

const UnderwritingRuleResult = () => {
    const [value, setValue] = useState(Tabs[0]);


    const data = [
        {
            "rule": "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
            "result": {
                "rule": "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
                "status": "Pass",
                "commentary": "The loan details provided for Natalie Carrasco Sotello and Samuel Sotello demonstrate stable and predictable income through consistent W2 forms and VOE records. Samuel Sotello's income shows a stable trend with slight variations in overtime, which is typical for his role as an electrician. Natalie's income shows a slight decrease in 2024, but her employment history and VOE indicate a stable career path. Both borrowers have provided sufficient documentation to verify their income, including W2s and VOEs. There is no indication of nontaxable income being used, and the tax returns requirements appear to be met through the provided W2s."
            }
        },
        {
            "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
            "result": {
                "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                "status": "Pass",
                "commentary": "The loan details provided include acceptable documentation for wage earners. Both Natalie Carrasco Sotello and Samuel Sotello have provided W-2 forms for the years 2023 and 2024, which are within the 1-2 year requirement. Samuel Sotello has also provided a VOE form, and both have paystubs dated within 30 days. Therefore, the rule is satisfied."
            }
        }
    ]


    return (<>

        <div className="flex  items-center">
            <ResultTab Tabs={Tabs} value={value} setValue={setValue} />
            <Button variant="result_download" label={'Download'} width={200} />
        </div>

        <div className="mt-2 border-b-1 border-gray-300"></div>
        <div className="text-[#26a3dd] mt-2">
            Underwriting Rule Results <span className="text-black">(LN-20250915-001)</span>
        </div>
        <div className="h-[100px] mt-3 w-full bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] rounded-2xl p-5">
            <div className="grid grid-cols-4 gap-4 h-full">
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">11</span>
                    <span className="flex items-center gap-1 text-sm">
                        <CheckCircleIcon className="text-green-500 text-base" />
                        Passed
                    </span>
                </div>
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">11</span>
                    <span className="flex items-center gap-1 text-sm">
                        <CancelOutlinedIcon className="text-red-500 text-base" />
                        Failed
                    </span>
                </div>
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">11</span>
                    <span className="flex items-center gap-1 text-sm">
                        <ErrorIcon className="text-yellow-500 text-base" />
                        Insufficient
                    </span>
                </div>
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">11</span>
                    <span className="flex items-center gap-1 text-sm">
                        <CheckCircleIcon className="text-green-500 text-base" />
                        Error
                    </span>
                </div>
            </div>
        </div>

        <div className="w-full">
            {/* Accordion for Income */}
            <div className="space-y-3">
                {data.map((item, idx) => {
                    const { result } = item;
                    const status = result?.status || "Unknown";

                    // status styles + icons
                    const statusConfig = {
                        Pass: { color: "text-green-600", icon: <CheckCircleIcon className="text-green-500 text-base" /> },
                        Fail: { color: "text-red-600", icon: <CancelOutlinedIcon className="text-red-500 text-base" /> },
                        Error: { color: "text-yellow-600", icon: <ErrorIcon className="text-yellow-500 text-base" /> },
                        Default: { color: "text-gray-600", icon: <CheckCircleIcon className="text-green-500 text-base" /> },
                    };
                    const { color, icon } = statusConfig[status] || statusConfig.Default;

                    return (
                        <Accordion key={idx} className="!shadow-sm !border !border-gray-200 mt-3">
                            {/* HEADER */}
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${idx}-content`}
                                id={`panel-${idx}-header`}
                                className="!bg-gray-100 !rounded-t-lg"
                            >
                                <div className="flex justify-between items-center w-full">
                                    {/* Left side: Rule number + truncated rule text */}
                                    <Typography className="font-medium text-gray-800 truncate max-w-[70%]">
                                        {`Rule ${idx + 1}: `}
                                    </Typography>

                                    {/* Right side: Status */}
                                    <div className={`flex items-center gap-1 text-sm font-medium `}>
                                        <span className="font-bold">Status: </span>
                                        {icon}
                                        <span>{status}</span>
                                    </div>
                                </div>
                            </AccordionSummary>

                            {/* BODY */}
                            <AccordionDetails>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="font-semibold">Commentary:</div>
                                        <p className="mt-1 text-gray-700">{result?.commentary || "—"}</p>
                                    </div>

                                    <div>
                                        <div className="font-semibold">Rule Text:</div>
                                        <p className="mt-1 text-gray-600">{result?.rule || item.rule}</p>
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </div>
        </div>
    </>)
};

export default UnderwritingRuleResult;
