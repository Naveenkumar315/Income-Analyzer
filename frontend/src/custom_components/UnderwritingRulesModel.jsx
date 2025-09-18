import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Rules from "./Rules";
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1200,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    height: "90vh"
};

const UnderwritingRulesModel = ({ rulesModel, OpenRulesModel }) => {


    const CloseModel = () => {
        debugger
        OpenRulesModel(false)
    }


    return (
        <Modal open={rulesModel} onClose={CloseModel}>
            <Box sx={style}>
                <Box
                    sx={{
                        borderRadius: "8px",
                        textAlign: "center",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column", // stack header + body
                        height: "100%", // make sure it fills container
                    }}
                >
                    {/* Header (static) */}
                    <div className="flex items-center justify-between border-b-2 border-gray-300 p-2 shrink-0">
                        <span className="text-xl font-bold text-[#26a3dd]">Underwriting Rules</span>
                        <CancelRoundedIcon onClick={CloseModel} className="text-red-500 cursor-pointer" />
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <Rules />
                    </div>
                </Box>
            </Box>

        </Modal>
    );
}

export default UnderwritingRulesModel