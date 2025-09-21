import { TbArrowMerge } from "react-icons/tb";
import Input from "../components/Input";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../components/Button";
import { useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

const EnterBorrowerName = ({
  from_name = "",
  to_name = "",
  setAddBorrower = () => {},
  addBorrower = {},
}) => {
  const [mergeChoice, setMergeChoice] = useState("from"); // default for merge
  const [customName, setCustomName] = useState("");

  const CloseModel = () => {
    setAddBorrower((prev) => ({ ...prev, model: false }));
  };

  const handleSave = () => {
    let finalName = "";

    if (addBorrower.mode === "add") {
      finalName = addBorrower.borrowerName.trim();
    } else {
      if (mergeChoice === "from") finalName = from_name;
      else if (mergeChoice === "to") finalName = to_name;
      else finalName = customName.trim();
    }

    if (finalName) {
      addBorrower.onSave(finalName);
      CloseModel();
    }
  };

  return (
    <Modal open={addBorrower.model} onClose={CloseModel}>
      <Box sx={style} className="text-center flex flex-col gap-6">
        {/* Icon */}
        <div className="flex justify-center">
          <TbArrowMerge className="text-blue-500 text-3xl" />
        </div>

        {/* Title */}
        <Typography variant="h6" className="font-semibold text-gray-800">
          {addBorrower.mode === "add" ? "Add Borrower" : "Merge Borrowers"}
        </Typography>

        {/* Description */}
        <Typography className="text-gray-600 text-sm">
          {addBorrower.mode === "add"
            ? "Enter a new borrower name to add to this loan package."
            : `Choose which name to keep, or enter a new one.`}
        </Typography>

        {/* Input Section */}
        {addBorrower.mode === "add" ? (
          <Input
            label="Borrower Name"
            placeholder="Borrower Name"
            value={addBorrower.borrowerName}
            onChange={(e) =>
              setAddBorrower((prev) => ({
                ...prev,
                borrowerName: e.target.value,
              }))
            }
          />
        ) : (
          <div className="text-left">
            <RadioGroup
              value={mergeChoice}
              onChange={(e) => setMergeChoice(e.target.value)}
            >
              <FormControlLabel
                value="from"
                control={<Radio />}
                label={`Keep "${from_name}"`}
              />
              <FormControlLabel
                value="to"
                control={<Radio />}
                label={`Keep "${to_name}"`}
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label="Enter new name"
              />
            </RadioGroup>

            {mergeChoice === "custom" && (
              <div className="mt-2">
                <Input
                  label="Custom Borrower Name"
                  placeholder="Borrower Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="secondary"
            label="Cancel"
            onClick={CloseModel}
            className="px-8"
          />
          <Button
            variant="primary"
            label="Save"
            onClick={handleSave}
            className="px-8"
          />
        </div>
      </Box>
    </Modal>
  );
};

export default EnterBorrowerName;
