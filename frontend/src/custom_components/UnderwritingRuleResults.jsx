import { use, useEffect, useState } from "react";
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
import { useUpload } from "../context/UploadContext";
import LoadingModal from "./LoaderModal";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const UnderwritingRuleResult = ({
  goBack,
  report,
  setReport,
  loadingStep = 0,
  onCancel = () => {},
}) => {
  const [value, setValue] = useState("Rule Results");
  const [expanded, setExpanded] = useState(false);
  const [tabs, setTabs] = useState(["Rule Results", "Summary", "Insights"]);
  const {
    isLoading,
    filtered_borrower,
    set_filter_borrower,
    borrowerList,
    setAnalyzedState,
  } = useUpload();

  const totalSteps = 3;
  // const borrowerData = report?.[filtered_borrower];
  const [borrowerData, setBorrowerData] = useState({});

  useEffect(() => {
    setBorrowerData(report?.[filtered_borrower]);
  }, [report, filtered_borrower]);

  useEffect(() => {
    debugger;
    console.log("filtered_borrower", filtered_borrower);
    console.log("repo", report);
    if (report?.[filtered_borrower]?.bankStatment?.length > 0) {
      setTabs((prevTabs) => {
        if (!prevTabs.includes("Bank Statement")) {
          return [...prevTabs, "Bank Statement"];
        }
        return prevTabs;
      });
    }
  }, [report]);

  const handleGetResult = (event, newValue) => {
    setValue(newValue);
  };

  // 🔹 Global loader: before first borrower is analyzed
  if (isLoading && !borrowerData) {
    return (
      <LoadingModal
        progress={Math.round((loadingStep / totalSteps) * 100)}
        currentStep={loadingStep}
        totalSteps={totalSteps}
        message={
          loadingStep === 0
            ? "Starting Analysis"
            : loadingStep === 1
            ? "Verifying Rules"
            : loadingStep === 2
            ? "Calculating Income"
            : "Fetching Insights"
        }
        onCancel={onCancel}
        isCompleted={false}
      />
    );
  }

  // 🔹 Per-borrower loader: if selected borrower not yet ready
  // if (Object.keys(report).length && !borrowerData) {
  //   return (
  //     <LoadingModal
  //       progress={0}
  //       currentStep={0}
  //       totalSteps={1}
  //       message={`Analyzing ${filtered_borrower}...`}
  //       isCompleted={false}
  //     />
  //   );
  // }

  return (
    <>
      <div className="flex  items-center my-2">
        <ResultTab
          Tabs={tabs}
          value={value}
          handleGetResult={handleGetResult}
        />
        <div className="flex-1 flex justify-center">
          <select
            onChange={(e) => {
              setAnalyzedState({ isAnalyzed: false, analyzed_data: {} });
              set_filter_borrower(e.target.value);
            }}
            value={filtered_borrower || ""}
            className="px-3 py-2 mx-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          >
            {borrowerList &&
              borrowerList.map((item, index) => {
                const isReady = !!report[item];
                return (
                  <option
                    key={index}
                    value={item}
                    disabled={!isReady}
                    className={isReady ? "text-black" : "text-gray-400"}
                  >
                    {/* {isReady ? "✔ " : "⏳ "}  */}
                    {item}
                  </option>
                );
              })}
          </select>
        </div>
        {/* <Button variant="result_download" label={"Download"} width={200} /> */}
      </div>

      <div className="mt-2 border-b-1 border-gray-300"></div>

      {/* ===== Summary Tab ===== */}
      {value === "Summary" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Summary{" "}
            <span className="text-black">
              : {sessionStorage.getItem("loanId") || ""}
            </span>
          </div>
          <div className="relative h-[100px] mt-3 w-full rounded-2xl overflow-hidden shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>
            <div className="relative p-5 h-full">
              <div className="grid grid-cols-6 gap-4">
                {(() => {
                  const entries = Object.entries(
                    borrowerData?.["income_summary"] || []
                  );
                  const qualifyingEntry = entries.find(
                    ([key]) => key === "Qualifying income"
                  );
                  const otherEntries = entries.filter(
                    ([key]) => key !== "Qualifying income"
                  );
                  const orderedEntries = qualifyingEntry
                    ? [qualifyingEntry, ...otherEntries]
                    : otherEntries;

                  return orderedEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow"
                    >
                      <span className="text-black font-bold pl-1">{value}</span>
                      <span className="flex items-center gap-1 text-sm">
                        {key}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
          <div className="w-full">
            <SummarySection summary_data={borrowerData["summary"]} />
          </div>
        </>
      )}

      {/* ===== Rule Results Tab ===== */}
      {value === "Rule Results" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Rule Results{" "}
            <span className="text-black">
              : {sessionStorage.getItem("loanId") || ""}
            </span>
          </div>
          <div className="h-[100px] mt-3 w-full relative rounded-2xl overflow-hidden shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>
            <div className="relative grid grid-cols-4 gap-4 h-full p-5">
              <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                <span className="text-black font-bold pl-1">
                  {borrowerData?.rules?.rule_result?.Pass}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <CheckCircleIcon className="text-green-500 text-base" />
                  Passed
                </span>
              </div>
              <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                <span className="text-black font-bold pl-1">
                  {borrowerData?.rules?.rule_result?.Fail}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <CancelOutlinedIcon className="text-red-500 text-base" />
                  Failed
                </span>
              </div>
              <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                <span className="text-black font-bold pl-1">
                  {borrowerData?.rules?.["rule_result"]?.["Insufficient data"]}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <ErrorIcon className="text-yellow-500 text-base" />
                  Insufficient
                </span>
              </div>
              <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                <span className="text-black font-bold pl-1">
                  {borrowerData?.rules?.rule_result?.["Error"]}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <CheckCircleIcon className="text-green-500 text-base" />
                  Error
                </span>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="space-y-3 max-h-[calc(55vh-100px)] overflow-auto">
              {borrowerData?.rules?.results?.map((item, idx) => {
                const { result } = item;
                const status = result?.status || "Unknown";
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
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${idx}-content`}
                      id={`panel-${idx}-header`}
                      className="!bg-gray-100 !rounded-t-lg"
                    >
                      <div className="flex justify-between items-start w-full gap-3">
                        {/* Left Side: Rule Number + Rule Text */}
                        <div className="flex flex-wrap items-start flex-1 gap-1 min-w-0">
                          <Typography
                            variant="body2"
                            component="span"
                            className="font-medium text-gray-800 shrink-0"
                          >
                            {`Rule ${idx + 1}:`}
                          </Typography>

                          <Typography
                            variant="body2"
                            component="span"
                            className="font-medium text-gray-800 break-words whitespace-normal flex-1"
                          >
                            {result?.rule || item.rule}
                          </Typography>
                        </div>

                        {/* Right Side: Status */}
                        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                          <span className="font-bold text-gray-700">
                            Status:
                          </span>
                          <span className="text-gray-800">{status}</span>
                        </div>
                      </div>
                    </AccordionSummary>

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

      {/* ===== Insights Tab ===== */}
      {value === "Insights" && (
        <>
          <div className="text-[#26a3dd] mt-2">
            Underwriting Insights{" "}
            <span className="text-black">
              : {sessionStorage.getItem("loanId") || ""}
            </span>
          </div>
          <div className="relative h-full mt-3 w-full rounded-2xl p-5 shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20"></div>
            <div className="relative flex flex-col gap-4 h-full">
              <span className="font-bold shrink-0">Income Insights</span>
              <div className="flex-1 overflow-y-auto whitespace-pre-line">
                {borrowerData?.insights || ""}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bank Statement */}

      {value === "Bank Statement" && (
        <>
          <div className="text-[#26a3dd] mt-2 font-semibold">
            Bank Statement Insights
          </div>

          <div className="relative  mt-3 w-full rounded-2xl p-5 shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 rounded-2xl"></div>

            <div className="relative flex flex-col gap-4 h-full">
              <div className="flex-1 overflow-y-auto whitespace-pre-line">
                {report?.[filtered_borrower]?.bankStatment.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 mb-3 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">
                          {item.field}
                        </span>
                        <span className="text-sm font-semibold text-blue-700">
                          {item.value}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        {item.commentary}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UnderwritingRuleResult;
