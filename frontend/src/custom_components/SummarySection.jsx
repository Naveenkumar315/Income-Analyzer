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

const SummarySection = ({ summary_data }) => {
  return (
    <div className="space-y-3">
      {summary_data.map((item, idx) => {
        const { result } = item;
        const status = result?.status || "Unknown";

        // status styles + icons
        const statusConfig = {
          Pass: {
            color: "text-green-600",
            icon: <CheckCircleIcon className="text-green-500 text-base" />,
          },
          Fail: {
            color: "text-red-600",
            icon: <CancelOutlinedIcon className="text-red-500 text-base" />,
          },
          Error: {
            color: "text-yellow-600",
            icon: <ErrorIcon className="text-yellow-500 text-base" />,
          },
          Default: {
            color: "text-gray-600",
            icon: <CheckCircleIcon className="text-green-500 text-base" />,
          },
        };
        const { color, icon } = statusConfig[status] || statusConfig.Default;

        return (
          <Accordion
            key={idx}
            className="!shadow-sm !border !border-gray-200 mt-3"
          >
            {/* HEADER */}
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${idx}-content`}
              id={`panel-${idx}-header`}
              className="!bg-gray-100 !rounded-t-lg"
            >
              <div className="flex justify-between items-center w-full">
                {/* Left side: Rule number + truncated rule text */}
                <Typography className="font-medium text-gray-800 truncate max-w-[70%]">
                  {item.title}
                </Typography>

                {/* Right side: Status */}
                {/* <div
                      className={`flex items-center gap-1 text-sm font-medium `}
                    >
                      <span className="font-bold">Status: </span>
                      {icon}
                      <span>{status}</span>
                    </div> */}
              </div>
            </AccordionSummary>

            {/* BODY */}
            <AccordionDetails>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold">
                    W-2/Paystub Monthly Total:
                  </div>
                  <p className="mt-1 text-gray-700">
                    {item?.paystub_month || "—"}
                  </p>
                </div>

                <div>
                  <div className="font-semibold">W-2 prior-year wages:</div>
                  <p className="mt-1 text-gray-600">{item.year_wages}</p>
                </div>
                <div>
                  <div className="font-semibold">Tax Return Monthly Total:</div>
                  <p className="mt-1 text-gray-600">{item.total_tax}</p>
                </div>
                <div>
                  <div className="font-semibold">
                    Total Monthly total_month:
                  </div>
                  <p className="mt-1 text-gray-600">{item.year_wages}</p>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default SummarySection;
