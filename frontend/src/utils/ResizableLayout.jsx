import React, { useState, useRef } from "react";

const ResizableLayout = ({ left, right, minLeft = 200, maxLeft = 600 }) => {
  const [leftWidth, setLeftWidth] = useState(300); // default width
  const isResizing = useRef(false);

  const startResize = () => {
    isResizing.current = true;

    // prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);
  };

  const stopResize = () => {
    isResizing.current = false;

    // restore text selection
    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResize);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    let newWidth = e.clientX;
    if (newWidth < minLeft) newWidth = minLeft;
    if (newWidth > maxLeft) newWidth = maxLeft;
    setLeftWidth(newWidth);
  };

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar */}
      <div
        className="h-full overflow-hidden border-r bg-white"
        style={{ width: leftWidth }}
      >
        {left}
      </div>

      {/* Resizer */}
      <div
        className="w-1 cursor-col-resize bg-gray-200 hover:bg-gray-400 transition"
        onMouseDown={startResize}
      ></div>

      {/* Right content */}
      <div className="flex-1 h-full overflow-hidden bg-gray-50">{right}</div>
    </div>
  );
};

export default ResizableLayout;
