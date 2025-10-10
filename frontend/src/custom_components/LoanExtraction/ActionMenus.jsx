import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const ActionMenus = ({
  mergeAnchorEl,
  onMergeClose,
  moveAnchorEl,
  onMoveClose,
  borrowers,
  selectedBorrowers,
  selectedFiles,
  onMergeBorrowerSelect,
  onMoveBorrowerSelect,
}) => {
  return (
    <>
      {/* Merge Menu */}
      <Menu
        anchorEl={mergeAnchorEl}
        open={Boolean(mergeAnchorEl)}
        onClose={onMergeClose}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Merge selected into
        </div>
        {borrowers
          .filter((b) => !selectedBorrowers.includes(b))
          .map((b) => (
            <MenuItem key={b} onClick={() => onMergeBorrowerSelect(b)}>
              {b}
            </MenuItem>
          ))}
      </Menu>

      {/* Move Menu */}
      <Menu
        anchorEl={moveAnchorEl}
        open={Boolean(moveAnchorEl)}
        onClose={onMoveClose}
      >
        <div className="px-4 py-2 text-sm font-semibold text-[#097aaf] border-b border-gray-200">
          Move categories to
        </div>
        {borrowers
          .filter((b) => !selectedFiles.some((f) => f.borrower === b))
          .map((b) => (
            <MenuItem key={b} onClick={() => onMoveBorrowerSelect(b)}>
              {b}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default React.memo(ActionMenus);
