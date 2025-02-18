interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  disabled = false
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        px-4
        py-2
        border
        border-gray-300
        rounded-lg
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-transparent
        disabled:bg-gray-100
        disabled:cursor-not-allowed
        ${className}
      `}
    />
  )
} 