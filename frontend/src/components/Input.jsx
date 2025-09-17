import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
const Input = ({
  id,
  label = "",
  name = "",
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  error,
  helperText = "",
  required = false,
  disabled = false,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" && showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full border-0 border-b-2 bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition ${
            error
              ? "border-red-500 focus:border-red-600"
              : "border-gray-300 focus:border-sky-500"
          } ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}
        />

        {type === "password" && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-2 text-gray-500 text-sm"
          >
            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
