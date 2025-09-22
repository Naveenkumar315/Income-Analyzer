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

export default function ConfirmMergeModal({
  borrowers,
  target,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal open={true} onClose={onCancel}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Confirm Merge
        </Typography>
        <Typography>
          Merge borrowers <strong>{borrowers.join(", ")}</strong> into{" "}
          <strong>{target}</strong>?
        </Typography>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
