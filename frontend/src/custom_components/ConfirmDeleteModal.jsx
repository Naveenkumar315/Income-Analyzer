import { Modal, Box, Typography, Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  width: 420,
};

export default function ConfirmDeleteModal({ borrower, onCancel, onConfirm }) {
  return (
    <Modal open={true} onClose={onCancel}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Confirm Delete
        </Typography>
        <Typography>
          Are you sure you want to delete borrower <strong>{borrower}</strong>{" "}
          and all its categories/files?
        </Typography>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(borrower)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
