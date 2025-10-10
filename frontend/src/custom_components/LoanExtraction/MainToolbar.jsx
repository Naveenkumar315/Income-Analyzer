import React from "react";
import { TbDatabaseEdit } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";

const MainToolbar = ({
  activeTab,
  hasModifications,
  onAddBorrower,
  onSelect,
  onViewOriginal,
  onExitOriginal,
}) => {
  if (activeTab === "original") {
    return (
      <div className="flex items-center justify-end bg-gray-50 border-b border-gray-200 px-4 py-2 shadow-sm">
        <Tooltip title="Close Original View">
          <CloseIcon
            className="text-red-500 cursor-pointer"
            onClick={onExitOriginal}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="text-sm text-[#26a3dd] hover:underline"
          onClick={onAddBorrower}
        >
          Add Borrower
        </button>
        <button
          className="text-sm text-gray-600 hover:text-[#26a3dd]"
          onClick={onSelect}
        >
          Select
        </button>
      </div>

      {hasModifications && (
        <Tooltip title="View Original Data">
          <button onClick={onViewOriginal}>
            <TbDatabaseEdit
              className="text-gray-600 cursor-pointer"
              size={18}
            />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default React.memo(MainToolbar);
