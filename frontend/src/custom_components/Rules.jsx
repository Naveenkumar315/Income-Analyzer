const rulesData = [
    {
        title: "Minimum Employment Duration",
        description: "Borrower must have at least 2 years of continuous employment in the same occupation or field.",
        explanation: "Stable employment demonstrates reliability and ability to sustain payments. Gaps longer than 30 days require explanation."
    },
    {
        title: "Consistent Income Across Years",
        description: "Income from year to year should not decline by more than 20% unless justified by job changes, medical leave, or other factors.",
        explanation: "Lenders prefer stable or increasing income streams. Significant decreases may signal financial instability."
    },
    {
        title: "Recurring Income Verification",
        description: "Bonuses, commissions, or other variable income must be shown in at least 2 consecutive years of tax returns or employer letters.",
        explanation: "Ensures that non-fixed income can be reasonably expected in future periods."
    },
    {
        title: "Debt-to-Income (DTI) Ratio Compliance",
        description: "Total monthly debt obligations (including housing, loans, credit cards) must not exceed 43% of the borrower’s gross monthly income.",
        explanation: "Protects against over-leverage, ensuring borrowers have capacity to repay without excessive stress."
    },
    {
        title: "Document Completeness",
        description: "All required documents (e.g., W-2s, 1099s, tax returns, bank statements) must be fully provided and legible.",
        explanation: "Missing or unreadable documents compromise the ability to verify income accurately."
    },
    {
        title: "Income Source Matching",
        description: "All income entries in bank statements and tax documents must correspond to known income sources.",
        explanation: "Detects unverified or irregular deposits that may be misleading or fraudulent."
    },
    {
        title: "Prorated Income for Partial-Year Work",
        description: "Income from employment or business that covers less than 12 months must be prorated based on actual months worked.",
        explanation: "Prevents overstating income for borrowers who started mid-year or had interruptions."
    },
    {
        title: "Self-Employment Income Averaging",
        description: "One-time bonuses, settlements, or tax refunds should not be included unless proven as repeatable income.",
        explanation: "Smooths out fluctuations to create a realistic representation of sustainable earnings."
    },
    {
        title: "Non-Recurring Income Exclusion",
        description: "Self-employed income must be averaged over at least 2 years to account for variability and seasonality.",
        explanation: "Avoids relying on temporary income sources that are unlikely to be available long-term."
    },
    {
        title: "Assets Verification and Availability",
        description: "Any liquid assets used to supplement income must be verified through statements and be free from liens or pending obligations.",
        explanation: "Confirms the borrower’s ability to cover shortfalls without hidden liabilities."
    },
    {
        title: "Credit and Payment History Review",
        description: "Borrowers should not have recent foreclosures, bankruptcies, or multiple late payments within the last 2 years unless circumstances are documented.",
        explanation: "A clean or improving credit history increases confidence in repayment ability."
    },
    {
        title: "Error & Insufficient Data Flagging",
        description: "Documents with unreadable sections, missing pages, or incomplete fields must be flagged and cannot be used for final income calculation until resolved.",
        explanation: "Protects against mistakes, ensuring underwriting decisions are based on verified data."
    },
    {
        title: "Housing Stability Requirement",
        description: "Borrower should have at least 6 months of consistent housing payments (rent or mortgage) to demonstrate affordability and payment responsibility.",
        explanation: "Establishes borrower’s ability to meet regular housing obligations without gaps."
    },

];

const Rules = () => {
    return (
        <div className="space-y-6 bg-white rounded-lg p-2 min-h-[400px] ">
            {rulesData.map((rule, index) => (
                <div key={index} className="border-b border-gray-200 p-4  ">
                    <p className=" font-semibold mb-1">
                        <span className="text-gray-600">Rule {index + 1}:</span> {rule.title}
                    </p>
                    <p className="text-gray-500 text-sm ">{rule.description}</p>
                    <p className="text-gray-500 text-sm">Explanation: {rule.explanation}</p>
                </div>
            ))}
        </div>
    );
};

export default Rules;
