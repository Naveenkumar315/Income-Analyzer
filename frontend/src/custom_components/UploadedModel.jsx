import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { CircularProgress, IconButton, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DataObjectSharpIcon from "@mui/icons-material/DataObjectSharp";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function UploadedModel({ setShowSection = () => {} }) {
  const [files, setFiles] = React.useState([]);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    console.log("Selected files:", files);
  }, [files]);

  const handleClose = () =>
    setShowSection((prev) => ({ ...prev, uploadedModel: false }));

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal open={true} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" fontWeight="600">
          Upload Documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload Documents to Start Extracting
        </Typography>

        {/* Drag and drop / click-to-upload box */}
        <Box
          sx={{
            border: "2px dashed #cfd8dc",
            borderRadius: "8px",
            p: 4,
            textAlign: "center",
            bgcolor: "#f9f9f9",
            cursor: "pointer",
            background: "linear-gradient(to right, #ffffff, #e0f2fe)", // white → sky blue
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: "#26a3dd" }} />
          <Typography fontWeight="500" mt={1}>
            Click or Drag and Drop
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported file types: .pdf, .json
          </Typography>
          <input
            type="file"
            accept=".pdf,.json"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Box>

        {/* File list */}
        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {files.map((file, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* <img
                    src="/pdf-icon.png"
                    alt="file"
                    style={{ width: 28, height: 28 }}
                  /> */}
                  <DataObjectSharpIcon style={{ width: 28, height: 28 }} />
                  <Box>
                    <Typography fontWeight="500">{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFile(idx)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={handleClose}>
            Discard
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#26a3dd", textTransform: "none" }}
            disabled={files.length === 0}
          >
            Upload
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
