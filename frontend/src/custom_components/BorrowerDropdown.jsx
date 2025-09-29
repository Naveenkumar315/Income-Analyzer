import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function BorrowerDropdown({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full px-4 py-2
             bg-white border border-gray-300 rounded-xl shadow-md
             text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition
             whitespace-normal break-words text-left"
      >
        {value || "Select borrower"}
        <FaChevronDown
          className={`h-5 w-5 ml-2 transform transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg  z-20
                    overflow-hidden transition-[max-height,opacity]
                    duration-300 ease-in-out
                    ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}
                   `}
      >
        {options.map((item) => (
          <div
            key={item}
            onClick={() => {
              onChange(item);
              setOpen(false);
            }}
            className="px-4 py-2 cursor-pointer hover:bg-blue-100 whitespace-normal break-words"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
