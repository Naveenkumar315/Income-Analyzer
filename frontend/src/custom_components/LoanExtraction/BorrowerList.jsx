import React from "react";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Checkbox from "@mui/material/Checkbox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { FaFolder } from "react-icons/fa";

const CategoryItem = ({
  name,
  borrower,
  docs,
  isSelected,
  selectMode,
  onSelect,
  onClick,
}) => (
  <li>
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${
        isSelected ? "bg-blue-50 border border-blue-300" : ""
      }`}
      onClick={onClick}
    >
      {selectMode && (
        <Checkbox
          size="small"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={onSelect}
        />
      )}
      <FaFolder className="text-gray-500" />
      <span className="truncate text-sm font-medium flex-1">{name}</span>
      <span className="ml-auto text-xs text-gray-500">({docs.length})</span>
    </div>
  </li>
);

const BorrowerItem = ({
  name,
  categories,
  isOpen,
  isEditing,
  editingName,
  isSelected,
  activeTab,
  selectMode,
  selectedCategory,
  onToggle,
  onSelect,
  onEditStart,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  setEditingName,
  isCatSelected,
  handleCategoryClick,
  handleSelectCategory,
}) => {
  return (
    <li>
      <div
        className="group flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectMode && activeTab === "modified" && (
            <Checkbox
              size="small"
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <PersonSharpIcon fontSize="small" />
          {isEditing ? (
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="border px-1 rounded text-sm flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
            />
          ) : (
            <span className="font-medium">{name}</span>
          )}
        </div>

        {activeTab === "modified" && !selectMode && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <>
                <SaveIcon
                  fontSize="small"
                  className="text-green-700 cursor-pointer"
                  onClick={onSaveEdit}
                />
                <CloseIcon
                  fontSize="small"
                  className="text-gray-600 cursor-pointer"
                  onClick={onCancelEdit}
                />
              </>
            ) : (
              <>
                <EditIcon
                  fontSize="small"
                  className="text-gray-600 cursor-pointer"
                  onClick={onEditStart}
                />
                <DeleteIcon
                  fontSize="small"
                  className="text-red-700 cursor-pointer"
                  onClick={onDelete}
                />
              </>
            )}
          </div>
        )}
        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      {isOpen && (
        <ul className="ml-8 mt-2 space-y-1">
          {categories.map(({ cat, docs }) => (
            <CategoryItem
              key={cat}
              name={cat}
              borrower={name}
              docs={docs}
              isSelected={isCatSelected(name, cat)}
              selectMode={selectMode && activeTab === "modified"}
              onSelect={(e) =>
                handleSelectCategory(e.target.checked, name, cat, docs)
              }
              onClick={() => handleCategoryClick(name, cat)}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const BorrowerList = ({
  borrowers,
  currentData,
  openBorrowers,
  editingBorrower,
  editingName,
  selectMode,
  selectedBorrowers,
  selectedCategory,
  activeTab,
  toggleBorrower,
  handleRenameBorrower,
  setEditingBorrower,
  setEditingName,
  setDeleteModal,
  setSelectedBorrowers,
  isCategorySelected,
  handleCategoryClick,
  setSelectedFiles,
  selectedFiles,
}) => {
  const handleSelectCategory = (checked, borrower, category, docs) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, { borrower, category, docs }]);
    } else {
      setSelectedFiles((prev) =>
        prev.filter(
          (f) => !(f.borrower === borrower && f.category === category)
        )
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <ul className="space-y-2">
        {borrowers.map((name) => {
          const categories = Object.keys(currentData[name] || {}).map(
            (cat) => ({ cat, docs: currentData[name][cat] })
          );
          const isEditing = editingBorrower === name;

          return (
            <BorrowerItem
              key={name}
              name={name}
              categories={categories}
              isOpen={openBorrowers[name]}
              isEditing={isEditing}
              editingName={editingName}
              isSelected={selectedBorrowers.includes(name)}
              activeTab={activeTab}
              selectMode={selectMode}
              selectedCategory={selectedCategory}
              onToggle={() => toggleBorrower(name)}
              onSelect={(e) => {
                setSelectedBorrowers((prev) =>
                  e.target.checked
                    ? [...prev, name]
                    : prev.filter((b) => b !== name)
                );
              }}
              onEditStart={(e) => {
                e.stopPropagation();
                setEditingBorrower(name);
                setEditingName(name);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                setDeleteModal(name);
              }}
              onSaveEdit={(e) => {
                e.stopPropagation();
                handleRenameBorrower(name, editingName);
              }}
              onCancelEdit={(e) => {
                e.stopPropagation();
                setEditingBorrower(null);
              }}
              setEditingName={setEditingName}
              isCatSelected={isCategorySelected}
              handleCategoryClick={handleCategoryClick}
              handleSelectCategory={handleSelectCategory}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(BorrowerList);
