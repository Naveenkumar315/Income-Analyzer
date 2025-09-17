const Button = ({ variant = "primary", label, width = 150 }) => {
    let baseStyle =
        `px-4 py-2 rounded-sm font-medium focus:outline-none focus:ring-2 transition cursor-pointer`;

    let variantStyle = "";

    if (variant === "primary") {
        variantStyle = `bg-[#26a3dd] text-white border:none`;
    } else if (variant === "secondary") {
        variantStyle = "bg-[#999999] text-white border:none";
    } else if (variant === "cancel") {
        variantStyle = "bg-white text-[#26a3dd] border-none";
    } else if (variant === "add-loan") {
        variantStyle = "text-white bg-gradient-to-r from-[#26a3dd] to-[#12699D]";
    } else if (variant === "start-analyze") {
        variantStyle = "text-white bg-gradient-to-r from-[#26a3dd] to-[#95bfd3]";
    } else if (variant === "upload-doc") {
        variantStyle = "text-black border border-[#26a3dd] border-2";
    }

    return (
        <button className={`${baseStyle} ${variantStyle}`} style={{ width: `${width}px` }}>
            {label}
        </button>
    );
}

export default Button;
