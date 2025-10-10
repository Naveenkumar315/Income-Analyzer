import React from "react";
import { TbArrowMerge, TbArrowRight } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";

const SelectionToolbar = ({
  selectedBorrowersCount,
  selectedFilesCount,
  onMergeClick,
  onMoveClick,
  onExitSelectMode,
}) => {
  const canMerge = selectedBorrowersCount > 0;

  return (
    <div className="flex justify-end items-center px-4 py-2 border-b border-gray-100 bg-blue-50">
      <div className="flex gap-4 items-center">
        <Tooltip
          title={
            canMerge
              ? "Merge selected borrowers"
              : "Select at least one borrower to merge"
          }
        >
          {/* This wrapper div is needed for the tooltip to work on a disabled button */}
          <div>
            <button
              onClick={onMergeClick}
              disabled={!canMerge}
              className="disabled:cursor-not-allowed"
            >
              <TbArrowMerge
                size={20}
                // The icon is now blue when the merge action is possible (1+ selected)
                className={canMerge ? "text-[#26a3dd]" : "text-gray-300"}
              />
            </button>
          </div>
        </Tooltip>
        <Tooltip title="Move selected categories">
          <button onClick={onMoveClick} disabled={selectedFilesCount === 0}>
            <TbArrowRight
              size={20}
              className={
                selectedFilesCount > 0
                  ? "text-[#26a3dd] cursor-pointer"
                  : "text-gray-300"
              }
            />
          </button>
        </Tooltip>
        <Tooltip title="Cancel selection">
          <button onClick={onExitSelectMode}>
            <CloseIcon
              className="text-red-500 cursor-pointer"
              fontSize="small"
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(SelectionToolbar);
