import React from "react";
import Button from "../../components/Button";

const LoanExtractionHeader = ({
  loanId,
  isAnalyzed,
  isUploaded,
  onViewResult,
  onStartAnalyzing,
  onUpload,
}) => {
  return (
    <div className="flex items-center justify-between pb-3 px-6 pt-4 bg-white border-b border-gray-200">
      <div className="font-medium text-gray-700">Loan ID : {loanId}</div>

      {isUploaded && (
        <div className="flex items-center gap-3">
          {isAnalyzed && (
            <Button
              variant="start-analyze"
              width={160}
              label="View Result"
              className="whitespace-nowrap"
              onClick={onViewResult}
            />
          )}
          {/* <Button
            variant="upload-doc"
            width={180}
            label="Upload Documents"
            className="whitespace-nowrap"
            onClick={onUpload}
          /> */}
          <Button
            variant="start-analyze"
            width={160}
            label="Start Analyzing"
            className="whitespace-nowrap"
            onClick={onStartAnalyzing}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(LoanExtractionHeader);
