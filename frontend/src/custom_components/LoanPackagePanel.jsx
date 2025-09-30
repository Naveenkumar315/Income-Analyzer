import React, { useState } from "react";

const LoanPackagePanel = ({ borrower, category, docs }) => {
  const [activeDoc, setActiveDoc] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState({}); // track subtabs per doc

  function formatCategory(cat = "") {
    return cat
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const renderTable = (rows = []) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return <p className="text-gray-400 italic">No data</p>;
    }
    const headers = Object.keys(rows[0] || {});
    return (
      <div className="overflow-auto max-h-80 border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-2 border-b font-semibold text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {headers.map((h) => (
                  <td key={h} className="p-2 border-b text-gray-700">
                    {String(r[h] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = (doc) => (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {Object.entries(doc).map(([field, value]) => {
        if (Array.isArray(value)) return null; // arrays handled separately
        return (
          <div key={field}>
            <span className="font-medium">{field}:</span>{" "}
            <span className="text-gray-700">{String(value)}</span>
          </div>
        );
      })}
    </div>
  );

  const renderDoc = (doc, idx) => {
    // special case Paystubs: has structured arrays
    if (category === "Paystubs") {
      const tab = activeSubTab[idx] || "Summary";
      const subTabs = ["Summary"];

      if (Array.isArray(doc.Earnings)) subTabs.push("Earnings");
      if (Array.isArray(doc.Deductions)) subTabs.push("Deductions");
      if (Array.isArray(doc["Pay Distribution"]))
        subTabs.push("Pay Distribution");

      return (
        <div className="space-y-3">
          {/* Sub-tabs */}
          <div className="border-b flex gap-6 text-sm">
            {subTabs.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setActiveSubTab((prev) => ({ ...prev, [idx]: t }))
                }
                className={`pb-2 ${
                  tab === t
                    ? "border-b-2 border-sky-600 text-sky-600 font-medium"
                    : "text-gray-600 hover:text-sky-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sub-tab content */}
          <div className="mt-2 overflow-auto max-h-[400px] pr-1">
            {tab === "Summary" && renderSummary(doc)}
            {tab === "Earnings" && renderTable(doc.Earnings)}
            {tab === "Deductions" && renderTable(doc.Deductions)}
            {tab === "Pay Distribution" && renderTable(doc["Pay Distribution"])}
          </div>
        </div>
      );
    }

    // generic case: render summary + any arrays as tables
    return (
      <div className="space-y-4">
        {renderSummary(doc)}
        {Object.entries(doc).map(([field, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div key={field}>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {field}
                </h3>
                {renderTable(value)}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  if (!Array.isArray(docs) || docs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <h2 className="text-xl font-bold text-sky-600 border-b pb-2">
          {borrower} / {formatCategory(category)}
        </h2>
        <p>No documents found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Title */}
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2 shrink-0">
        {borrower} / {formatCategory(category)}
      </h2>

      {/* Document Tabs */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {docs.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDoc(idx)}
            className={`px-3 py-2 text-sm whitespace-nowrap ${
              activeDoc === idx
                ? "border-b-2 border-sky-600 text-sky-600 font-medium"
                : "text-gray-600 hover:text-sky-600"
            }`}
          >
            {category} {idx + 1}
          </button>
        ))}
      </div>

      {/* Active Document */}
      <div className="flex-1 overflow-auto p-4">
        {renderDoc(docs[activeDoc], activeDoc)}
      </div>
    </div>
  );
};

export default React.memo(LoanPackagePanel);
