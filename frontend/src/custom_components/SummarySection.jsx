import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const SummarySection = ({ summary_data = [] }) => {


  return (
    <div className="space-y-3 px-1">
      <Accordion className="!shadow-sm !border !border-gray-200 mt-3">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="summary-content"
          id="summary-header"
          className="!bg-gray-100 !rounded-t-lg"
        >
          <Typography className="font-medium text-gray-800">
            Income Calculation Worksheet & Details
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <div className="space-y-4 text-sm ">
            {summary_data?.map((item, idx) => (
              <div key={idx} className="border-b pb-2">
                <div className="font-semibold capitalize">
                  {item.field.replace(/_/g, " ")}:
                </div>
                <p className="mt-1 text-gray-700">
                  <span className="font-bold">Value:</span> {item.value}
                </p>
                {/* <p className="mt-1 text-gray-600">
                  <span className="font-bold">Status:</span> {item.status}
                </p> */}
                <p className="mt-1 text-gray-600">
                  <span className="font-bold">Commentary:</span> {item.commentary}
                </p>
                <p className="mt-1 text-gray-600">
                  <span className="font-bold">Calculation:</span> {item.calculation_commentry}
                </p>
              </div>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

    </div>
  );
};

export default SummarySection;
