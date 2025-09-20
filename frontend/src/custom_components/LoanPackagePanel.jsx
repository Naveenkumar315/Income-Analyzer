export default function LoanPackagePanel({ borrower, category, docs }) {
  if (!docs) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      <h2 className="text-xl font-bold text-sky-600 border-b pb-2 shrink-0">
        {borrower} / {category}
      </h2>

      <div className="flex-1 overflow-auto flex flex-col gap-4">
        {docs.map((doc, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg shadow-sm bg-white"
          >
            <div className="p-3 bg-gray-100 rounded-t-lg font-semibold text-gray-700">
              {category} - {idx + 1}
            </div>
            <div className="p-3 overflow-auto max-h-[calc(100vh-250px)]">
              <table className="w-full text-left text-sm">
                <tbody>
                  {Object.entries(doc).map(([field, value]) => {
                    if (
                      ["Title", "Url", "StageName", "GeneratedOn"].includes(
                        field
                      )
                    )
                      return null;
                    return (
                      <tr
                        key={field}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-2 font-semibold w-1/3">{field}</td>
                        <td className="p-2">{value}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-gray-200">
                    <td className="p-2 font-semibold">Document</td>
                    <td className="p-2">
                      <a
                        href={doc.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:underline"
                      >
                        View PDF
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
