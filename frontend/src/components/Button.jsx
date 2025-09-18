const Button = ({
  variant = "primary",
  label,
  width = 150,
  onClick = () => { },
  disabled = false,
}) => {
  let baseStyle =
    "px-4 py-2 rounded-sm font-medium focus:outline-none transition cursor-pointer";

  let variantStyle = "";

  if (variant === "primary") {
    variantStyle = "bg-[#26a3dd] text-white";
  } else if (variant === "secondary") {
    variantStyle = "bg-[#999999] text-white";
  } else if (variant === "cancel") {
    variantStyle = "bg-white text-[#26a3dd]";
  } else if (variant === "add-loan") {
    variantStyle = "text-white bg-gradient-to-r from-[#26a3dd] to-[#12699D]";
  } else if (variant === "start-analyze") {
    variantStyle = "text-white bg-gradient-to-r from-[#26a3dd] to-[#95bfd3]";
  } else if (variant === "upload-doc") {
    variantStyle = "text-black border border-[#26a3dd] border-2 border-l-2 border-t-1 border-r-1 border-b-2";
  } else if (variant = "upload-document") {
    variantStyle = "text-black border border-[#26a3dd] border-2 border-l-2 border-t-2 border-r-1 border-b-1";
  } else {
    variantStyle = "bg-[#999999] text-white";
  }

  // Disabled style
  const disabledStyle =
    "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60";

  return (
    <button
      className={`${baseStyle} ${disabled ? disabledStyle : variantStyle}`}
      style={{ width: `${width}px` }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
