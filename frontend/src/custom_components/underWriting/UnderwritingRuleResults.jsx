import React, { useEffect, useState } from "react";
import ResultTab from "./ResultTab";
import Button from "../../components/Button";
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
import { useUpload } from "../../context/UploadContext";
import LoadingModal from "../../modals/LoaderModal";

const UnderwritingRuleResult = ({
  goBack,
  report,
  setReport,
  loadingStep = 0,
  onCancel = () => {},
  handleStepChange = () => {},
}) => {
  const [value, setValue] = useState("Rule Results");
  const [expanded, setExpanded] = useState(false);
  const [tabs, setTabs] = useState([
    "Rule Results",
    "Summary",
    "Insights",
    "Self Employee",
  ]);
  const {
    isLoading,
    filtered_borrower,
    set_filter_borrower,
    borrowerList,
    setAnalyzedState,
  } = useUpload();

  const totalSteps = 3;
  const [borrowerData, setBorrowerData] = useState({});

  useEffect(() => {
    setBorrowerData(report?.[filtered_borrower]);
  }, [report, filtered_borrower]);

  useEffect(() => {
    try {
      if (
        report?.[filtered_borrower]?.bankStatement &&
        report?.[filtered_borrower]?.bankStatement.length > 0
      ) {
        setTabs((prevTabs) => {
          if (!prevTabs.includes("Bank Statement")) {
            return [...prevTabs, "Bank Statement"];
          }
          return prevTabs;
        });
      }
    } catch (ex) {
      console.log("error in setting tabs", ex);
    }
  }, [report]);

  const handleGetResult = (event, newValue) => {
    setValue(newValue);
  };

  const borrower = report?.[filtered_borrower]?.self_employee;

  // 🔹 Global loader: before first borrower is analyzed
  if (isLoading && !borrowerData) {
    return (
      <LoadingModal
        progress={Math.round((loadingStep / totalSteps) * 100)}
        currentStep={loadingStep}
        totalSteps={totalSteps}
        message={`Analyzing ${filtered_borrower}`}
        onCancel={onCancel}
        isCompleted={false}
      />
    );
  }

  // Helper: detect empty or missing data
  const hasData = (data) => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    return Object.keys(data || {}).length > 0;
  };

  const renderNoData = (section) => (
    <div className="p-6 text-center text-gray-500 text-sm">
      {`Insufficient documents for ${section.toLowerCase()} insights.`}
    </div>
  );

  return (
    <>
      <div className="sticky top-0 py-2 z-1 bg-white">
        <div className="flex items-center my-2">
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
                      {item}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
      </div>

      {/* ===== Rule Results Tab ===== */}
      {value === "Rule Results" && (
        <>
          {hasData(borrowerData?.rules?.results) ? (
            <div className="space-y-3 px-[2px] pb-2">
              {borrowerData.rules.results.map((item, idx) => {
                const result = item.result || {};
                const status = result?.status || "Unknown";
                return (
                  <Accordion
                    key={idx}
                    className={`!shadow-sm mt-3 ${
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
                        <div>
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
          ) : (
            renderNoData("Rule Results")
          )}
        </>
      )}

      {/* ===== Summary Tab ===== */}
      {value === "Summary" &&
        (hasData(borrowerData?.summary) ? (
          <SummarySection summary_data={borrowerData.summary} />
        ) : (
          renderNoData("Summary")
        ))}

      {/* ===== Insights Tab ===== */}
      {value === "Insights" &&
        (hasData(borrowerData?.insights) ? (
          <div className="relative flex flex-col gap-4 h-full rounded-2xl p-3 bg-[url('/insights-bg.png')] bg-cover">
            <div className="flex-1 whitespace-pre-line">
              <div className="font-bold shrink-0 mb-2">Income Insights</div>
              {borrowerData.insights}
            </div>
          </div>
        ) : (
          renderNoData("Insights")
        ))}

      {/* ===== Bank Statement Tab ===== */}
      {value === "Bank Statement" &&
        (hasData(borrowerData?.bankStatement) ? (
          <div className="relative mt-3 w-full rounded-2xl p-5 ">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 rounded-2xl"></div>
            <div className="relative flex flex-col gap-4 h-full">
              <div className="flex-1 overflow-y-auto whitespace-pre-line">
                {borrowerData.bankStatement.map((item, index) => (
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
                ))}
              </div>
            </div>
          </div>
        ) : (
          renderNoData("Bank Statement")
        ))}

      {/* ===== Self Employee Tab ===== */}
      {value === "Self Employee" &&
        (hasData(borrower) ? (
          <div className="flex flex-col gap-6 w-full p-3">
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 w-full">
              {Object.entries(borrower || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="grid grid-cols-[220px_1fr] gap-4 border-b border-gray-100 pb-2"
                >
                  <span className="font-semibold text-gray-700">{key}</span>
                  <span className="text-gray-900">
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          renderNoData("Self Employee")
        ))}
    </>
  );
};

export default UnderwritingRuleResult;
