interface BoxProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  margin?: string;
}

export function Box({ children, className = "", padding = "p-4", margin = "m-0" }: BoxProps) {
  return (
    <div className={`${padding} ${margin} bg-black rounded-lg ${className}`}>
      {children}
    </div>
  )
} 