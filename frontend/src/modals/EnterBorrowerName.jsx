import { TbArrowMerge } from "react-icons/tb";
import Input from "../components/Input";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "../components/Button";

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
  onSave = () => {}, // Accept onSave as a direct prop
}) => {
  const CloseModel = () => {
    setAddBorrower((prev) => ({ ...prev, model: false }));
  };

  const handleChange = (e) => {
    setAddBorrower((prev) => ({
      ...prev,
      borrowerName: e.target.value,
    }));
  };

  const isMerge = Boolean(from_name && to_name);

  return (
    <Modal open={addBorrower.model} onClose={CloseModel}>
      <Box sx={style} className="text-center flex flex-col gap-6">
        <div className="flex justify-center">
          <TbArrowMerge className="text-blue-500 text-3xl" />
        </div>

        <Typography variant="h6" className="font-semibold text-gray-800">
          {isMerge ? "Merge Borrowers" : "Add Borrower"}
        </Typography>

        <Typography className="text-gray-600 text-sm">
          {isMerge ? (
            <>
              Enter a New Borrower name to merge{" "}
              <span className="font-bold text-gray-800">{from_name}</span> with{" "}
              <span className="font-bold text-gray-800">{to_name}</span>
            </>
          ) : (
            "Enter a new borrower name to add to the loan package"
          )}
        </Typography>

        <div className="mt-2">
          <Input
            label="Enter Borrower Name"
            placeholder="Borrower Name"
            onChange={handleChange}
            value={addBorrower?.borrowerName}
          />
        </div>

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
            onClick={() => {
              if (addBorrower.borrowerName.trim()) {
                // Call the onSave prop directly
                onSave(addBorrower.borrowerName.trim());
              }
              CloseModel();
            }}
            className="px-8"
          />
        </div>
      </Box>
    </Modal>
  );
};

export default EnterBorrowerName;
