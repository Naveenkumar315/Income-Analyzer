import React from "react";
import { TbDatabaseEdit } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import RestoreIcon from "@mui/icons-material/Restore";
import { toast } from "react-toastify";
import api from "../../api/client"; // ✅ adjust path if needed
import { useUpload } from "../../context/UploadContext";

const MainToolbar = ({
  activeTab,
  hasModifications,
  onAddBorrower,
  onSelect,
  onViewOriginal,
  onExitOriginal,
  setModifiedData,
}) => {
  const { set_normalized_json, setHasModifications } = useUpload();
  // 🔄 Restore Original Cleaned Data
  const handleRestoreOriginal = async () => {
    try {
      const email = sessionStorage.getItem("email");
      const loanId = sessionStorage.getItem("loanId");
      const username = sessionStorage.getItem("username");

      if (!email || !loanId) {
        toast.error("Missing email or loan ID");
        return;
      }

      // 🔥 Call backend to restore
      const res = await api.post("/restore-original-cleaned-data", {
        email,
        loanID: loanId,
        username,
      });

      if (res?.data?.cleaned_json) {
        setModifiedData(res.data.cleaned_json);
        set_normalized_json(res.data.cleaned_json);
        setHasModifications(false);
        onExitOriginal();
        toast.success("Restored to original cleaned data!");
      } else {
        toast.warn("No original cleaned data found for this loan.");
      }
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore. Please try again.");
    }
  };

  if (activeTab === "original") {
    return (
      <div className="flex items-center gap-2 justify-end bg-gray-50 border-b border-gray-200 px-4 py-2 shadow-sm">
        <Tooltip title="Restore Original Data">
          <RestoreIcon
            className="text-blue-500 cursor-pointer hover:text-blue-700"
            onClick={handleRestoreOriginal}
          />
        </Tooltip>
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
