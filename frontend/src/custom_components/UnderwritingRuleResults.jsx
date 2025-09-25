import { useEffect, useState } from "react";
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
import BackLink from "./BackLink";
import api from "../api/client";
import { useUpload } from "../context/UploadContext";
import Loader from "./Loader";
import LoadingModal from "./LoaderModal";

const Tabs = ["Rule Results", "Summary", "Insights"];

const UnderwritingRuleResult = ({
  goBack,
  report,
  setReport,
  loadingStep = 0,
  onCancel = () => { },
}) => {
  const [value, setValue] = useState(Tabs[0]);
  const [expanded, setExpanded] = useState(false);
  const { isLoading } = useUpload();
  const totalSteps = 3;
  useEffect(() => {
    console.log("report", report);
  }, [report]);

  const handleGetResult = async (event, newValue) => {
    debugger;
    try {
      setValue(newValue);
      let email = sessionStorage.getItem("email") || "";
      let loanId = sessionStorage.getItem("loanId") || "";
      if (newValue === "Summary") {
        // const response = await api.post("/income-calc", null, {
        //   params: { email, loanID: loanId },
        // });
        // const result = response?.data?.income[0]["checks"].filter((x) =>
        //   x.field.includes("current")
        // );
        // const final_res = result?.reduce((acc, item) => {
        //   acc[item.field] = item.value;
        //   return acc;
        // }, {});
        // const summaryData = result.reduce((acc, item) => {
        //   acc[item.field] = item; // keep full object, not just value
        //   return acc;
        // }, {});
        // setReport((prev) => ({
        //   ...prev,
        //   summary: result,
        //   income_summary: final_res,
        //   summaryData: summaryData,
        // }))
      } else if (newValue === "Insights") {
        // debugger
        // const response = await api.post("/income-insights", null, {
        //   params: { email, loanID: loanId },
        // });
        // setReport((prev) => ({
        //   ...prev,
        //   insights: response?.data?.income_insights?.insight_commentry || ""
        // }))
        // console.log('response_Insights', response?.data);
      } else {
      }
    } catch (error) {
      console.error(`handleGetResult: ${error}`);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          {/* <Loader /> */}
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
            onCancel={onCancel} // use prop from IncomeAnalyzer
            isCompleted={loadingStep === totalSteps}
          />
        </div>
      ) : (
        <>
          {/* <BackLink onClick={goBack} /> */}

          <div className="flex  items-center">
            <ResultTab
              Tabs={Tabs}
              value={value}
              handleGetResult={handleGetResult}
            />
            <Button variant="result_download" label={"Download"} width={200} />
          </div>

          <div className="mt-2 border-b-1 border-gray-300"></div>
          {isLoading && <Loader />}
          {value === "Summary" && (
            <>
              <div className="text-[#26a3dd] mt-2">
                Underwriting Summary{" "}
                <span className="text-black">(LN-20250915-001)</span>
              </div>
              <div className="relative h-[100px] mt-3 w-full rounded-2xl overflow-hidden shadow">
                <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>

                <div className="relative p-5 h-full">
                  <div className="grid grid-cols-6 gap-4">
                    {(() => {
                      const entries = Object.entries(
                        report?.["income_summary"] || []
                      );
                      // Separate "Qualifying income"
                      const qualifyingEntry = entries.find(
                        ([key]) => key === "Qualifying income"
                      );
                      const otherEntries = entries.filter(
                        ([key]) => key !== "Qualifying income"
                      );

                      // Combine with qualifying income first
                      const orderedEntries = qualifyingEntry
                        ? [qualifyingEntry, ...otherEntries]
                        : otherEntries;

                      return orderedEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow"
                        >
                          <span className="text-black font-bold pl-1">
                            {value}
                          </span>
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
                <SummarySection summary_data={report["summary"]} />
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
                    <span className="text-black font-bold pl-1">
                      {report?.rules?.rule_result?.Pass}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <CheckCircleIcon className="text-green-500 text-base" />
                      Passed
                    </span>
                  </div>
                  <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">
                      {report?.rules?.rule_result?.Fail}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <CancelOutlinedIcon className="text-red-500 text-base" />
                      Failed
                    </span>
                  </div>
                  <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">
                      {report?.rules?.["rule_result"]?.["Insufficient data"]}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <ErrorIcon className="text-yellow-500 text-base" />
                      Insufficient
                    </span>
                  </div>
                  <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
                    <span className="text-black font-bold pl-1">
                      {report?.rules?.rule_result?.["Error"]}
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
                  {report?.rules?.results?.map((item, idx) => {
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
                        icon: (
                          <ErrorIcon className="text-yellow-500 text-base" />
                        ),
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
                    ${expanded === idx
                            ? "!border-2 !border-[#26a3dd]"
                            : "!border !border-gray-200"
                          }`}
                        expanded={expanded === idx}
                        onChange={() =>
                          setExpanded(expanded === idx ? false : idx)
                        }
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
              <div className="relative h-[55vh] mt-3 w-full rounded-2xl p-5 shadow">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20"></div>
                <div className="relative flex flex-col gap-4 h-full">
                  <span className="font-bold shrink-0">Income Insights</span>
                  <div className="flex-1 overflow-y-auto whitespace-pre-line">
                    {report?.insights || ""}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default UnderwritingRuleResult;
