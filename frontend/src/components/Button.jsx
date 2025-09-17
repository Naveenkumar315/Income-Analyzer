const Button = ({ variant = "primary", label, width=150 }) => {
    let baseStyle =
        `px-4 py-2 rounded-lg font-medium w-[${width}px] focus:outline-none focus:ring-2 transition cursor-pointer`;

    let variantStyle = "";

    if (variant === "primary") {
        variantStyle = `bg-[#26a3dd] text-white border:none`;
    } else if (variant === "secondary") {
        variantStyle = "bg-[#999999] text-white border:none";
    } else if (variant === "cancel") {
        variantStyle = "bg-white text-[#26a3dd] border-none";
    } else if (variant === "danger") {
        variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400";
    }

    return (
        <button className={`${baseStyle} ${variantStyle}`}>
            {label}
        </button>
    );
}

export default Button;
