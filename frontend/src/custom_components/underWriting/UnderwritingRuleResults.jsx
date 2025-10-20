import React, { useEffect, useState } from "react";
import ResultTab from "./ResultTab";
import SummarySection from "./SummarySection";
import LoadingModal from "../../modals/LoaderModal";
import { useUpload } from "../../context/UploadContext";

const UnderwritingRuleResult = ({
  report,
  setReport,
  loadingStep = 0,
  onCancel = () => {},
}) => {
  const [value, setValue] = useState("Rule Results");
  const [expanded, setExpanded] = useState(false);
  const [tabs, setTabs] = useState([
    "Rule Results",
    "Summary",
    "Insights",
    "Self Employee",
  ]);
  const { isLoading, filtered_borrower, set_filter_borrower, borrowerList } =
    useUpload();

  const totalSteps = 3; // total steps for first borrower

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
        setTabs((prevTabs) =>
          prevTabs.includes("Bank Statement")
            ? prevTabs
            : [...prevTabs, "Bank Statement"]
        );
      }
    } catch (ex) {
      console.error("Error updating tabs:", ex);
    }
  }, [report, filtered_borrower]);

  const handleGetResult = (event, newValue) => {
    setValue(newValue);
  };

  const borrower = report?.[filtered_borrower]?.self_employee;

  // 🔹 Loader for **first borrower in progress**
  if (isLoading && borrowerList[0] === filtered_borrower) {
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
      {/* Header with tabs and borrower dropdown */}
      <div className="sticky top-0 py-2 z-1 bg-white">
        <div className="flex items-center my-2">
          <ResultTab
            Tabs={tabs}
            value={value}
            handleGetResult={handleGetResult}
          />
          <div className="flex-1 flex justify-center">
            <select
              onChange={(e) => set_filter_borrower(e.target.value)}
              value={filtered_borrower || ""}
              className="px-3 py-2 mx-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
            >
              {borrowerList.map((item, index) => {
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
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${
                      expanded === idx ? "border-blue-500" : "border-gray-200"
                    }`}
                    onClick={() => setExpanded(expanded === idx ? false : idx)}
                  >
                    <div className="flex justify-between items-start w-full gap-3">
                      <div className="flex flex-wrap items-start flex-1 gap-1 min-w-0">
                        <span className="font-medium text-gray-800">
                          {`Rule ${idx + 1}:`}
                        </span>
                        <span className="font-medium text-gray-800 break-words whitespace-normal flex-1">
                          {result?.rule || item.rule}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                        <span className="font-bold text-gray-700">Status:</span>
                        <span className="text-gray-800">{status}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="font-semibold">Commentary:</div>
                      <p className="mt-1 rounded p-2 bg-blue-50 text-[#26a3dd]">
                        {result?.commentary || "—"}
                      </p>
                    </div>
                  </div>
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
          <div className="relative mt-3 w-full rounded-2xl p-5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 rounded-2xl"></div>
            <div className="relative flex flex-col gap-4 h-full overflow-y-auto">
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
