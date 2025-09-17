import { useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";

const LoanExatraction = ({ showSection = {}, setShowSection = () => {} }) => {
  const [selected, setSelected] = useState("Employment Records");

  const menuItems = [
    "Form_1007",
    "Mortgage",
    "Note",
    "Paystubs",
    "Employment Records",
    "Bank Statements",
  ];

  const documents = [
    {
      title: "Paystub_June_2025",
      fieldCount: 6,
      fields: [
        { label: "Employer Name", value: "Acme Corp" },
        { label: "Pay Period", value: "06/01/2025 - 06/30/2025" },
        { label: "Gross Income", value: "$6,500" },
        { label: "Deductions", value: "$1,200" },
        { label: "Net Income", value: "$5,300" },
        { label: "Payment Date", value: "07/05/2025" },
      ],
    },
    {
      title: "BankStatement_May_2025",
      fieldCount: 2,
      fields: [
        { label: "Account Number", value: "XXXX1234" },
        { label: "Available Balance", value: "$25,000" },
      ],
    },
  ];

  return (
    <div>
      <>
        <div className="flex justify-between items-center p-2 rounded-lg">
          {/* Left side: filename */}
          <span className="font-medium">
            Upload & Extract Files (LN-20250915-001)
          </span>

          {/* Right side: buttons */}
          <div className="flex gap-2">
            <Button
              variant="upload-doc"
              width={200}
              label={"Upload Documents"}
              onClick={() =>
                setShowSection((prev) => ({ ...prev, uploadedModel: true }))
              }
            />
            <Button
              variant="start-analyze"
              width={200}
              label={"Start Analyzing"}
            />
          </div>
        </div>

        <div className="flex border-t border-gray-300 max-h-[calc(100vh-80px)] ">
          {/* Left section - 30% */}
          <div className="w-[30%] border-r border-gray-300 p-2 overflow-y-auto">
            <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item}
                  onClick={() => setSelected(item)}
                  className={`p-2 cursor-pointer border-b  hover:bg-gray-50
        ${
          item === selected
            ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
            : "border-gray-200"
        }
      `}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right section - 70% */}
          <div className="w-[70%] p-2 space-y-3 ">
            <div className="space-y-4 h-[400px] overflow-y-auto">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg shadow-sm bg-white"
                >
                  <div className="flex  items-center gap-[30px] font-medium p-2 bg-gray-100 rounded-t-lg cursor-pointer">
                    <span className="text-gray-800">{doc.title}</span>
                    <span className="text-sm text-gray-500">
                      {doc.fieldCount} Fields Extracted
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {/* Static first row */}
                      <tr className="border-t bg-gray-100 border-gray-200">
                        <td className="p-2">Fields</td>
                        <td className="p-2">Value</td>
                      </tr>

                      {/* Dynamic rows */}
                      {doc.fields.map((field, i) => (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="p-2 font-semibold">{field.label}</td>
                          <td className="p-2">{field.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
      {showSection.uploadedModel && (
        <UploadedModel setShowSection={setShowSection} />
      )}
    </div>
  );
};

export default LoanExatraction;
