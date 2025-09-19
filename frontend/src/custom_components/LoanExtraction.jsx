import { useEffect, useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";
import LoanPackagePanel from "./LoanPackagePanel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";

import { useUpload } from "../context/UploadContext";

const LoanExatraction = ({ showSection = {}, setShowSection = () => {} }) => {
  const { isUploaded, setIsUploaded, normalized_json } = useUpload();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setrawData] = useState(normalized_json || {});

  useEffect(() => {
    setrawData(normalized_json);
  }, [normalized_json]);

  const menuItems = [
    ...new Set(
      rawData && typeof rawData === "object"
        ? Object.values(rawData).flatMap((borrowerDocs) =>
            borrowerDocs ? Object.keys(borrowerDocs) : []
          )
        : []
    ),
  ];

  // Step 2: Get docs for selected category across all borrowers
  const documents =
    rawData && typeof rawData === "object"
      ? Object.entries(rawData).flatMap(([borrower, borrowerDocs]) =>
          borrowerDocs && borrowerDocs[selectedCategory]
            ? borrowerDocs[selectedCategory].map((doc) => ({
                borrower,
                ...doc,
              }))
            : []
        )
      : [];

  const OpenRulesModel = () => {
    setRulesModel(true);
  };

  const HandleProcess = () => {
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: true,
    }));
  };

  return (
    <div>
      <>
        <div className="flex justify-between items-center rounded-lg  pb-3">
          {/* Left side: filename */}
          <span className="font-medium">
            Upload & Extract Files {sessionStorage.getItem("loanId") || ""}
          </span>
          {isUploaded?.uploaded && (
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
                onClick={HandleProcess}
              />
            </div>
          )}
        </div>

        {/* <div className="flex border-t border-gray-300 max-h-[calc(100vh-80px)] ">
                    <div className="w-[30%] border-r border-gray-300 p-2 overflow-y-auto">
                        <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
                        <ul>
                            {menuItems.map((item) => (
                                <li
                                    key={item}
                                    onClick={() => setSelected(item)}
                                    className={`p-2 cursor-pointer border-b  hover:bg-gray-50
                                            ${item === selected
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
                                            <tr className="border-t bg-gray-100 border-gray-200">
                                                <td className="p-2">Fields</td>
                                                <td className="p-2">Value</td>
                                            </tr>

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
                </div> */}
        {isUploaded?.uploaded ? (
          <LoanPackagePanel
            menuItems={menuItems}
            documents={documents}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        ) : (
          <UnuploadedScreen setShowSection={setShowSection} />
        )}

        {/* */}

        {/* <div> */}
        <div className="fixed bottom-4 right-4 flex items-center justify-center w-[50px] h-[50px] rounded-3xl bg-[#12699D] shadow-lg cursor-pointer">
          <DescriptionIcon onClick={OpenRulesModel} className="text-white" />
        </div>

        <UnderwritingRulesModel
          rulesModel={rulesModel}
          OpenRulesModel={setRulesModel}
        />

        {/* </div> */}

        {/* {(<>
                    <div className="flex items-center justify-center border-t border-gray-300 max-h-[calc(100vh-80px)]">
                        <div className="flex items-center justify-center flex-col gap-5 mt-30">
                            <span className="text-gray-400 text-small">No documents yet, Upload to start Extracting.</span>
                            <Button width={200} variant="upload-document" label={'Upload Documents'} />
                        </div>
                    </div>
                </>)} */}
      </>
      {showSection.uploadedModel && (
        <UploadedModel setShowSection={setShowSection} />
      )}
    </div>
  );
};

export default LoanExatraction;
