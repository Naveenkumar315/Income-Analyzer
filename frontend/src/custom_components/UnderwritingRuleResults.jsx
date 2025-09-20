import { useState } from "react";
import ResultTab from "./ResultTab";
import Button from "../components/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import SummarySection from "./SummarySection";

const Tabs = ["Rule Results", "Summary", "Insights"];

const UnderwritingRuleResult = ({ goBack }) => {
  const [value, setValue] = useState(Tabs[0]);
  const [expanded, setExpanded] = useState(false);

  const data = [
    {
      rule: "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
      result: {
        rule: "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
        status: "Pass",
        commentary:
          "The loan details provided for Natalie Carrasco Sotello and Samuel Sotello demonstrate stable and predictable income through consistent W2 forms and VOE records. Samuel Sotello's income shows a stable trend with slight variations in overtime, which is typical for his role as an electrician. Natalie's income shows a slight decrease in 2024, but her employment history and VOE indicate a stable career path. Both borrowers have provided sufficient documentation to verify their income, including W2s and VOEs. There is no indication of nontaxable income being used, and the tax returns requirements appear to be met through the provided W2s.",
      },
    },
    {
      rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
      result: {
        rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
        status: "Pass",
        commentary:
          "The loan details provided include acceptable documentation for wage earners. Both Natalie Carrasco Sotello and Samuel Sotello have provided W-2 forms for the years 2023 and 2024, which are within the 1-2 year requirement. Samuel Sotello has also provided a VOE form, and both have paystubs dated within 30 days. Therefore, the rule is satisfied.",
      },
    },
    {
      rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
      result: {
        rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
        status: "Pass",
        commentary:
          "The loan details provided include acceptable documentation for wage earners. Both Natalie Carrasco Sotello and Samuel Sotello have provided W-2 forms for the years 2023 and 2024, which are within the 1-2 year requirement. Samuel Sotello has also provided a VOE form, and both have paystubs dated within 30 days. Therefore, the rule is satisfied.",
      },
    },
    {
      rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
      result: {
        rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
        status: "Pass",
        commentary:
          "The loan details provided include acceptable documentation for wage earners. Both Natalie Carrasco Sotello and Samuel Sotello have provided W-2 forms for the years 2023 and 2024, which are within the 1-2 year requirement. Samuel Sotello has also provided a VOE form, and both have paystubs dated within 30 days. Therefore, the rule is satisfied.",
      },
    },
    {
      rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
      result: {
        rule: "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
        status: "Pass",
        commentary:
          "The loan details provided include acceptable documentation for wage earners. Both Natalie Carrasco Sotello and Samuel Sotello have provided W-2 forms for the years 2023 and 2024, which are within the 1-2 year requirement. Samuel Sotello has also provided a VOE form, and both have paystubs dated within 30 days. Therefore, the rule is satisfied.",
      },
    },
  ];

  const summary_data = [
    {
      title: "Income Calculator worksheet & details",
      paystub_month: "$1000.00",
      year_wages:
        "96,392, 101,821, 101,821, 96,392, 157,525, 167,874, 167,870,15,526 (stability reference).",
      total_tax: "$1000.00",
      total_month: "$8000.00",
    },
  ];

  return (
    <>
      <p onClick={goBack} className="text-blue-400 cursor-pointer">
        ← Back
      </p>
      <div className="flex  items-center">
        <ResultTab Tabs={Tabs} value={value} setValue={setValue} />
        <Button variant="result_download" label={"Download"} width={200} />
      </div>

      <div className="mt-2 border-b-1 border-gray-300"></div>

      {value === "Summary" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Summary{" "}
            <span className="text-black">(LN-20250915-001)</span>
          </div>
          <div className="relative h-[100px] mt-3 w-full rounded-2xl overflow-hidden shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>

            <div className="relative p-5 h-full">
              <div className="grid grid-cols-3 gap-4 h-full">
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow">
                  <span className="text-black font-bold pl-1">$8000.00</span>
                  <span className="flex items-center gap-1 text-sm">
                    Total Monthly Income
                  </span>
                </div>
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow">
                  <span className="text-black font-bold pl-1">$1000.00</span>
                  <span className="flex items-center gap-1 text-sm">
                    W-2/Paystub Monthly
                  </span>
                </div>
                <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow">
                  <span className="text-black font-bold pl-1">$1000.00</span>
                  <span className="flex items-center gap-1 text-sm">
                    Tax-Return Monthly
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <SummarySection summary_data={summary_data} />
          </div>
        </>
      )}
      {value === "Rule Results" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Rule Results{" "}
            <span className="text-black">(LN-20250915-001)</span>
          </div>
          <div className="h-[100px] mt-3 w-full relative rounded-2xl overflow-hidden shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>

            <div className="relative grid grid-cols-4 gap-4 h-full p-5">
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

          <div className="w-full ">
            <div className="space-y-3 max-h-[calc(55vh-100px)] overflow-auto">
              {data.map((item, idx) => {
                const { result } = item;
                const status = result?.status || "Unknown";

                // status styles + icons
                const statusConfig = {
                  Pass: {
                    color: "text-green-600",
                    icon: (
                      <CheckCircleIcon className="text-green-500 text-base" />
                    ),
                  },
                  Fail: {
                    color: "text-red-600",
                    icon: (
                      <CancelOutlinedIcon className="text-red-500 text-base" />
                    ),
                  },
                  Error: {
                    color: "text-yellow-600",
                    icon: <ErrorIcon className="text-yellow-500 text-base" />,
                  },
                  Default: {
                    color: "text-gray-600",
                    icon: (
                      <CheckCircleIcon className="text-green-500 text-base" />
                    ),
                  },
                };
                const { color, icon } =
                  statusConfig[status] || statusConfig.Default;

                return (
                  <Accordion
                    key={idx}
                    className={`!shadow-sm mt-3 
                    ${
                      expanded === idx
                        ? "!border-2 !border-[#26a3dd]"
                        : "!border !border-gray-200"
                    }`}
                    expanded={expanded === idx}
                    onChange={() => setExpanded(expanded === idx ? false : idx)}
                  >
                    {/* HEADER */}
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${idx}-content`}
                      id={`panel-${idx}-header`}
                      className="!bg-gray-100 !rounded-t-lg"
                    >
                      <div className="flex justify-between items-center w-full">
                        {/* Left side: Rule number + truncated rule text */}
                        <Typography
                          variant="body2"
                          component="span"
                          className="font-medium text-gray-800 truncate max-w-[70%]"
                        >
                          {`Rule ${idx + 1}: `}
                        </Typography>

                        {/* Right side: Status */}
                        <div
                          className={`flex items-center gap-1 text-sm font-medium `}
                        >
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
                          <div className="font-semibold">Rule Text:</div>
                          <p className="mt-1 text-gray-600">
                            {result?.rule || item.rule}
                          </p>
                        </div>
                        <div className="">
                          <div className="font-semibold">Commentary:</div>
                          <p className="mt-1 rounded p-2 bg-blue-50 text-[#26a3dd]">
                            {result?.commentary || "—"}
                          </p>
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </div>
          </div>
        </>
      )}
      {value === "Insights" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Insights{" "}
            <span className="text-black">(LN-20250915-001)</span>
          </div>
          <div className="relative h-[150px] mt-3 w-full rounded-2xl overflow-hidden p-5 shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 "></div>

            <div className="relative flex flex-col gap-4 h-full">
              <span className="font-bold">Title</span>
              <span>Description</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UnderwritingRuleResult;
