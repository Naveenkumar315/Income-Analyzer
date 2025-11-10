import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import ResultTab from "./ResultTab";
import Button from "../../components/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import SummarySection from "./SummarySection";
import { useUpload } from "../../context/UploadContext";
import LoadingModal from "../../modals/LoaderModal";

/** JSX version (no TypeScript types)
 * Key improvements kept:
 * - Derived data via useMemo instead of state
 * - Stable handlers via useCallback
 * - Memoized small presentational components
 * - One-time sessionStorage read
 * - Safer hasData util
 */

const TAB = {
  rule_result: "Rule Results",
  summary: "Wage Earner",
  self_employee: "Self-Employed",
  reo: "REO",
  insights: "Insights",
  bank_statement: "Bank Statement",
};



// ---------- small presentational bits ----------
const SectionHeader = memo(function SectionHeader({ title, loanId }) {
  return (
    <div className="text-[#26a3dd] mt-2">
      {title} <span className="text-black">: {loanId}</span>
    </div>
  );
});

const StatTile = memo(function StatTile({ value, icon, label }) {
  return (
    <div className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl">
      <span className="text-black font-bold pl-1">{value ?? 0}</span>
      <span className="flex items-center gap-1 text-sm">
        {icon}
        {label}
      </span>
    </div>
  );
});

const RuleAccordionItem = memo(
  function RuleAccordionItem({ idx, item, expanded, onToggle, borrowerKey }) {
    const result = item?.result ?? {};
    const status = result?.status ?? "Unknown";
    const ruleText = result?.rule ?? item?.rule ?? "";

    const handleChange = useCallback(() => onToggle(idx), [idx, onToggle]);

    return (
      <Accordion
        className={`!shadow-sm mt-3 ${expanded ? "!border-2 !border-[#26a3dd]" : "!border !border-gray-200"
          }`}
        expanded={expanded}
        onChange={handleChange}
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
                {ruleText}
              </Typography>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium shrink-0">
              <span className="font-bold text-gray-700">Status:</span>
              <span className="text-gray-800">{status}</span>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold">Rule Text:</div>
              <p className="mt-1 text-gray-600">{ruleText}</p>
            </div>
            <div>
              <div className="font-semibold">Commentary:</div>
              <p className="mt-1 rounded p-2 bg-blue-50 text-[#26a3dd]">
                {result?.commentary ?? "—"}
              </p>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    );
  },
  // ✅ custom comparison — re-render if borrower or item changes
  (prev, next) =>
    prev.borrowerKey === next.borrowerKey &&
    prev.expanded === next.expanded &&
    prev.idx === next.idx &&
    prev.item === next.item
);


const CardRow = memo(function CardRow({ label, value }) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-4 border-b border-gray-100 pb-2">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
});

function hasData(data) {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === "object") return Object.keys(data || {}).length > 0;
  return Boolean(data);
}

const UnderwritingRuleResult = ({
  goBack,
  report,
  setReport,
  loadingStep = 0,
  onCancel = () => { },
  handleStepChange = () => { },
}) => {
  const [expandedIdx, setExpandedIdx] = useState(false);
  const [value, setValue] = useState(TAB.rule_result);

  const { isLoading, filtered_borrower, set_filter_borrower, borrowerList, setAnalyzedState } = useUpload();

  const totalSteps = 3;

  useEffect(() => {
    // Reset expanded accordion when borrower changes
    setExpandedIdx(false);
  }, [filtered_borrower]);

  // Derived data — no effects needed
  const borrowerData = useMemo(() => (report?.[filtered_borrower] ?? {}), [report, filtered_borrower]);
  const borrower = borrowerData?.self_employee ?? {};
  const reo_summary = borrowerData?.reo_summary ?? [];

  const loanId = useMemo(() => sessionStorage.getItem("loanId") || "", []);

  // Tabs computed from data
  const tabs = useMemo(() => {
    const base = [TAB.rule_result, TAB.summary, TAB.self_employee, TAB.reo, TAB.insights];
    const hasBank = Array.isArray(borrowerData?.bankStatement) && borrowerData.bankStatement.length > 0;
    if (!hasBank) return base;
    const withBank = base.slice();
    withBank.splice(2, 0, TAB.bank_statement); // insert at index 2
    return withBank;
  }, [borrowerData?.bankStatement]);

  // Stable handlers
  const handleGetResult = useCallback((_, newValue) => setValue(newValue), []);
  const onToggleAccordion = useCallback((idx) => setExpandedIdx(prev => (prev === idx ? false : idx)), []);
  const onBorrowerChange = useCallback((e) => {
    setAnalyzedState({ isAnalyzed: false, analyzed_data: {} });
    set_filter_borrower(e.target.value);
  }, [setAnalyzedState, set_filter_borrower]);

  const ruleCounts = useMemo(() => ({
    pass: borrowerData?.rules?.rule_result?.Pass ?? 0,
    fail: borrowerData?.rules?.rule_result?.Fail ?? 0,
    insufficient: borrowerData?.rules?.rule_result?.["Insufficient data"] ?? 0,
    error: borrowerData?.rules?.rule_result?.Error ?? 0,
  }), [borrowerData?.rules?.rule_result]);

  // IMPORTANT: define all hooks BEFORE any early returns
  const renderNoData = useCallback((section) => (
    <div className="p-6 text-center text-gray-500 text-sm">{`Insufficient documents for ${section.toLowerCase()} insights.`}</div>
  ), []);

  // Global loader: before first borrower is analyzed
  const showInitialLoader = isLoading && !hasData(borrowerData);
  if (showInitialLoader) {
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

  return (
    <>
      <div className="sticky top-0 py-2 z-30 bg-white">
        <div className="flex items-center my-2">
          <ResultTab Tabs={tabs} value={value} handleGetResult={handleGetResult} />
          <div className="flex-1 flex justify-center">
            <select
              onChange={onBorrowerChange}
              value={filtered_borrower || ""}
              className="px-3 py-2 mx-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
            >
              {(borrowerList ?? []).map((item, index) => {
                const isReady = !!report?.[item];
                return (
                  <option key={index} value={item} disabled={!isReady} className={isReady ? "text-black" : "text-gray-400"}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {value === TAB.rule_result && (
          <>
            <SectionHeader title="Rule Results" loanId={loanId} />
            <div className="relative h-[100px] mt-3 w-full rounded-2xl overflow-hidden shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>
              <div className="relative p-5 h-full">
                <div className="grid grid-cols-4 gap-4">
                  <StatTile value={ruleCounts.pass} icon={<CheckCircleIcon className="text-green-600" />} label="Pass" />
                  <StatTile value={ruleCounts.fail} icon={<CancelOutlinedIcon className="text-red-600" />} label="Fail" />
                  <StatTile value={ruleCounts.insufficient} icon={<ReportGmailerrorredIcon className="text-yellow-600" />} label="Insufficient" />
                  <StatTile value={ruleCounts.error} icon={<ErrorIcon className="text-orange-600" />} label="Error" />
                </div>
              </div>
            </div>
          </>
        )}

        {value === TAB.summary && (
          <>
            <SectionHeader title="Underwriting Summary" loanId={loanId} />
            <div className="relative h-[100px] mt-3 w-full rounded-2xl overflow-hidden shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-[#26a3dd] to-[#bcdff0] opacity-30"></div>
              <div className="relative p-5 h-full">
                <div className="grid grid-cols-6 gap-4">
                  {(() => {
                    const entries = Object.entries(borrowerData?.["income_summary"] ?? {});
                    const qualifyingEntry = entries.find(([key]) => key === "Qualifying income");
                    const otherEntries = entries.filter(([key]) => key !== "Qualifying income");
                    const orderedEntries = qualifyingEntry ? [qualifyingEntry, ...otherEntries] : otherEntries;
                    return orderedEntries.map(([key, val]) => (
                      <div key={key} className="flex flex-col p-2 gap-1 pl-5 bg-white rounded-2xl shadow">
                        <span className="text-black font-bold pl-1">{val}</span>
                        <span className="flex items-center gap-1 text-sm">{key}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </>
        )}

        {value === TAB.bank_statement && (
          <>
            <SectionHeader title="Bank Statement Insights" loanId={loanId} />
          </>
        )}

        {value === TAB.self_employee && (
          <SectionHeader title="Self-Employed" loanId={loanId} />
        )}

        {value === TAB.reo && (
          <SectionHeader title="REO" loanId={loanId} />
        )}

        {value === TAB.insights && (
          <>
            <SectionHeader title="Underwriting Insights" loanId={loanId} />
          </>
        )}
      </div>

      {/* ===== Rule Results Tab ===== */}
      {value === TAB.rule_result && (
        hasData(borrowerData?.rules?.results) ? (
          <div className="space-y-3 px-[2px] pb-2 mt-3">
            {(borrowerData?.rules?.results ?? []).map((item, idx) => (
              <RuleAccordionItem
                key={`${filtered_borrower}-${idx}`}
                borrowerKey={filtered_borrower}
                idx={idx}
                item={item}
                expanded={expandedIdx === idx}
                onToggle={onToggleAccordion}
              />
            ))}
          </div>
        ) : (
          renderNoData(TAB.rule_result)
        )
      )}

      {/* ===== Summary Tab ===== */}
      {value === TAB.summary && (
        hasData(borrowerData?.summary) ? (
          <SummarySection summary_data={borrowerData.summary} />
        ) : (
          renderNoData(TAB.summary)
        )
      )}

      {/* ===== Bank Statement Tab ===== */}
      {value === TAB.bank_statement && (
        hasData(borrowerData?.bankStatement) ? (
          <div className="relative mt-3 w-full rounded-2xl p-5 ">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 rounded-2xl"></div>
            <div className="relative flex flex-col gap-4 h-full">
              <div className="flex-1 overflow-y-auto whitespace-pre-line">
                {(borrowerData?.bankStatement ?? []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 mb-3 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{item?.field}</span>
                      <span className="text-sm font-semibold text-blue-700">{item?.value}</span>
                    </div>
                    {item?.commentary && (
                      <div className="mt-2 text-sm text-gray-600">{item.commentary}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          renderNoData(TAB.bank_statement)
        )
      )}

      {/* ===== Self-Employed Tab ===== */}
      {value === TAB.self_employee && (
        hasData(borrower) ? (
          <div className="flex flex-col gap-6 w-full p-3">
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 w-full">
              {Object.entries(borrower).map(([key, val]) => (
                <CardRow key={key} label={key} value={Array.isArray(val) ? val.join(", ") : String(val)} />
              ))}
            </div>
          </div>
        ) : (
          renderNoData(TAB.self_employee)
        )
      )}

      {/* ===== REO Tab ===== */}
      {value === TAB.reo && (
        hasData(reo_summary) ? (
          <div className="relative mt-3 w-full rounded-2xl p-5 ">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d6f1ff] to-[#b0e2de] opacity-20 rounded-2xl"></div>
            <div className="relative flex flex-col gap-4 h-full">
              <div className="flex-1 overflow-y-auto whitespace-pre-line">
                {(reo_summary || []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 mb-3 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 text-sm font-medium">Field:</span>
                        <span className="font-semibold text-gray-800">{item?.field}</span>
                        {item?.status && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === "Pass" ? "bg-green-100 text-green-700" : item.status === "Fail" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-sm font-medium">Value:</span>
                        <span className="text-sm font-semibold text-blue-700">{item?.value}</span>
                      </div>
                    </div>
                    {item?.commentary && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="text-gray-500 font-medium">Commentary: </span>
                        {item.commentary}
                      </div>
                    )}
                    {item?.calculation_commentry && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        <span className="not-italic text-gray-500 font-medium">Calculation Commentary:</span>{" "}
                        {item.calculation_commentry}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          renderNoData(TAB.reo)
        )
      )}

      {/* ===== Insights Tab ===== */}
      {value === TAB.insights && (
        hasData(borrowerData?.insights) ? (
          <div className="relative flex flex-col gap-4 h-full rounded-2xl p-3 bg-[url('/insights-bg.png')] bg-cover">
            <div className="flex-1 whitespace-pre-line">
              <div className="font-bold shrink-0 mb-2">Income Insights</div>
              {borrowerData?.insights}
            </div>
          </div>
        ) : (
          renderNoData(TAB.insights)
        )
      )}
    </>
  );
};

export default UnderwritingRuleResult;