import { Box, Chip, Avatar } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ZoomInSharpIcon from "@mui/icons-material/ZoomInSharp";

const StepChips = ({ activeStep, onStepChange }) => {
    const uploadChipProps = {
        avatar: (
            <Avatar sx={{ bgcolor: activeStep === 0 ? "#26a3dd" : "#f3f4f6" }}>
                <CloudUploadIcon fontSize="small" sx={{ color: activeStep === 0 ? "white" : "#d3dbde" }} />
            </Avatar>
        ),
        label: "Upload & Extract Files",
        onClick: () => onStepChange(0),
        sx: {
            backgroundColor: "#fff",
            fontWeight: "bold",
            border: `1px solid ${activeStep === 0 ? "#26a3dd" : "lightgray"}`,
            color: activeStep === 0 ? "#26a3dd" : "gray",
            py: 2.5,
            px: 2,
            cursor: "pointer",
            borderRadius: "30px",
            width: "230px"
        },
    };

    const analyzeChipProps = {
        avatar: (
            <Avatar sx={{ bgcolor: activeStep === 1 ? "#26a3dd" : "#f3f4f6" }}>
                <ZoomInSharpIcon fontSize="small" sx={{ color: activeStep === 1 ? "white" : "#d3dbde" }} />
            </Avatar>
        ),
        label: "Analysis Result",
        onClick: () => onStepChange(1),
        sx: {
            backgroundColor: "#fff",
            fontWeight: "bold",
            border: `1px solid ${activeStep === 1 ? "#26a3dd" : "lightgray"}`,
            color: activeStep === 1 ? "#26a3dd" : "gray",
            py: 2.5,
            px: 2,
            cursor: "pointer",
            borderRadius: "30px",
            width: "230px"
        },
    };

    return (
        <Box display="flex" justifyContent="center" marginBottom={2} alignItems="center" gap={0}>
            <Chip {...uploadChipProps} />
            <Box
                sx={{
                    width: "50px",
                    height: "2px",
                    backgroundColor: activeStep === 1 ? "#26a3dd" : "lightgray",
                    transition: "all 0.3s ease"
                    // mx: 2,
                }}
            />
            <Chip {...analyzeChipProps} />
        </Box>
    );
};

export default StepChips;
