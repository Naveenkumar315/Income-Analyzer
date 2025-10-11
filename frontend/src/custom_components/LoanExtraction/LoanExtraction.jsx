import React, { useState } from "react";
import { useUpload } from "../../context/UploadContext";
import { useLoanDataManagement } from "./useLoanDataManagement";

// UI Components
import LoanExtractionHeader from "./LoanExtractionHeader";
import MainToolbar from "./MainToolbar";
import SelectionToolbar from "./SelectionToolbar";
import BorrowerList from "./BorrowerList";
import ActionMenus from "./ActionMenus";
import LoanPackagePanel from "./LoanPackagePanel";

// Utils and Modals
import ResizableLayout from "../../utils/ResizableLayout";
import UnuploadedScreen from "../../utils/UnuploadedScreen";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "../../modals/UnderwritingRulesModel";
import UploadedModel from "../../modals/UploadedModel";
import EnterBorrowerName from "../../modals/EnterBorrowerName";
import ConfirmMergeModal from "../../modals/ConfirmMergeModal";
import ConfirmMoveModal from "../../modals/ConfirmMoveModal";
import ConfirmDeleteModal from "../../modals/ConfirmDeleteModal";

const LoanExtraction = ({ showSection, setShowSection, handleStepChange }) => {
  const {
    isUploaded,
    analyzedState,
    setIsSAClicked,
    setAnalyzedState,
    setReport,
    normalized_json,
    set_normalized_json,
    setHasModifications,
  } = useUpload();
  const loanId = sessionStorage.getItem("loanId") || "";

  // All data logic is now in this custom hook
  const {
    currentData,
    borrowers,
    activeTab,
    hasModifications,
    openBorrowers,
    selectedBorrower,
    selectedCategory,
    selectMode,
    selectedBorrowers,
    selectedFiles,
    editingBorrower,
    editingName,
    setSelectMode,
    setSelectedBorrowers,
    setSelectedFiles,
    setEditingBorrower,
    setEditingName,
    toggleBorrower,
    handleAddBorrower,
    handleDeleteBorrower,
    handleRenameBorrower,
    handleMerge,
    handleMove,
    handleViewOriginal,
    handleExitOriginalView,
    isCategorySelected,
    handleCategoryClick,
    setModifiedData,
  } = useLoanDataManagement();

  // State for modals and menus
  const [rulesModel, setRulesModel] = useState(false);
  const [addBorrowerModal, setAddBorrowerModal] = useState({
    model: false,
    borrowerName: "",
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [mergeAnchorEl, setMergeAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);

  // --- Header Action Handlers ---
  const onViewResult = () => {
    setIsSAClicked(false);
    setShowSection((p) => ({
      ...p,
      startAnalyzing: true,
      extractedSection: false,
    }));
    handleStepChange(1);
  };

  const onStartAnalyzing = () => {
    setReport({});
    setAnalyzedState((prev) => ({
      ...prev,
      isAnalyzed: false,
      analyzed_data: {},
    }));
    setShowSection((p) => ({
      ...p,
      startAnalyzing: true,
      extractedSection: false,
    }));
  };

  // --- Toolbar Action Handlers ---
  const onExitSelectMode = () => {
    setSelectMode(false);
    setSelectedBorrowers([]);
    setSelectedFiles([]);
  };

  const hasData = isUploaded?.uploaded || normalized_json;

  return (
    <>
      <div className="h-full flex flex-col">
        <LoanExtractionHeader
          loanId={loanId}
          isAnalyzed={analyzedState?.isAnalyzed}
          isUploaded={hasData}
          onViewResult={onViewResult}
          onStartAnalyzing={onStartAnalyzing}
          onUpload={() =>
            setShowSection((p) => ({ ...p, uploadedModel: true }))
          }
        />

        <div className="flex flex-1 min-h-0">
          {hasData ? (
            <ResizableLayout
              left={
                <div className="h-full flex flex-col bg-white">
                  {selectMode ? (
                    <SelectionToolbar
                      selectedBorrowersCount={selectedBorrowers.length}
                      selectedFilesCount={selectedFiles.length}
                      onMergeClick={(e) => setMergeAnchorEl(e.currentTarget)}
                      onMoveClick={(e) => setMoveAnchorEl(e.currentTarget)}
                      onExitSelectMode={onExitSelectMode}
                    />
                  ) : (
                    <MainToolbar
                      activeTab={activeTab}
                      hasModifications={hasModifications}
                      onAddBorrower={() =>
                        setAddBorrowerModal({ model: true, borrowerName: "" })
                      }
                      onSelect={() => setSelectMode(true)}
                      onViewOriginal={handleViewOriginal}
                      onExitOriginal={handleExitOriginalView}
                      setModifiedData={setModifiedData}
                      set_normalized_json={set_normalized_json}
                      setHasModifications={setHasModifications}
                    />
                  )}
                  <BorrowerList
                    borrowers={borrowers}
                    currentData={currentData}
                    openBorrowers={openBorrowers}
                    editingBorrower={editingBorrower}
                    editingName={editingName}
                    selectMode={selectMode}
                    selectedBorrowers={selectedBorrowers}
                    selectedCategory={selectedCategory}
                    activeTab={activeTab}
                    toggleBorrower={toggleBorrower}
                    handleRenameBorrower={handleRenameBorrower}
                    setEditingBorrower={setEditingBorrower}
                    setEditingName={setEditingName}
                    setDeleteModal={setDeleteModal}
                    setSelectedBorrowers={setSelectedBorrowers}
                    isCategorySelected={isCategorySelected}
                    handleCategoryClick={handleCategoryClick}
                    setSelectedFiles={setSelectedFiles}
                    selectedFiles={selectedFiles}
                  />
                </div>
              }
              right={
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedBorrower &&
                    selectedCategory &&
                    currentData?.[selectedBorrower]?.[selectedCategory] ? (
                      <LoanPackagePanel
                        borrower={selectedBorrower}
                        category={selectedCategory}
                        docs={
                          currentData[selectedBorrower][selectedCategory] || []
                        }
                      />
                    ) : (
                      <div className="text-gray-400 flex items-center justify-center h-full">
                        Select a category to view documents
                      </div>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
            <UnuploadedScreen setShowSection={setShowSection} />
          )}
        </div>

        {/* Floating Rules Button */}
        <div className="fixed bottom-4 right-4 w-[50px] h-[50px] bg-[#12699D] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f5a7a] transition-colors">
          <DescriptionIcon
            onClick={() => setRulesModel(true)}
            className="text-white cursor-pointer"
          />
        </div>
      </div>

      {/* Modals and Menus */}
      <UnderwritingRulesModel
        rulesModel={rulesModel}
        OpenRulesModel={setRulesModel}
      />
      {showSection.uploadedModel && (
        <UploadedModel setShowSection={setShowSection} />
      )}
      {addBorrowerModal.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrowerModal}
          addBorrower={addBorrowerModal}
          onSave={handleAddBorrower} // Pass handler
        />
      )}
      {mergeModal && (
        <ConfirmMergeModal
          borrowers={selectedBorrowers}
          target={mergeModal.target}
          onCancel={() => setMergeModal(null)}
          onConfirm={() => {
            handleMerge(mergeModal.target);
            setMergeModal(null);
          }}
        />
      )}
      {moveModal && (
        <ConfirmMoveModal
          fromBorrower={moveModal.from}
          toBorrower={moveModal.to}
          files={moveModal.files}
          onCancel={() => setMoveModal(null)}
          onConfirm={() => {
            handleMove(moveModal.to);
            setMoveModal(null);
          }}
        />
      )}
      {deleteModal && (
        <ConfirmDeleteModal
          borrower={deleteModal}
          onCancel={() => setDeleteModal(null)}
          onConfirm={(b) => {
            handleDeleteBorrower(b);
            setDeleteModal(null);
          }}
        />
      )}

      <ActionMenus
        mergeAnchorEl={mergeAnchorEl}
        onMergeClose={() => setMergeAnchorEl(null)}
        moveAnchorEl={moveAnchorEl}
        onMoveClose={() => setMoveAnchorEl(null)}
        borrowers={borrowers}
        selectedBorrowers={selectedBorrowers}
        selectedFiles={selectedFiles}
        onMergeBorrowerSelect={(target) => {
          setMergeAnchorEl(null);
          setMergeModal({ target });
        }}
        onMoveBorrowerSelect={(target) => {
          setMoveAnchorEl(null);
          setMoveModal({
            from: selectedFiles[0]?.borrower,
            to: target,
            files: selectedFiles,
          });
        }}
      />
    </>
  );
};

export default React.memo(LoanExtraction);
