interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  className?: string;
}

export function Text({ children, variant = 'body', className = "" }: TextProps) {
  const variantStyles = {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-medium',
    body: 'text-base',
    small: 'text-sm'
  }

  return (
    <p className={`${variantStyles[variant]} ${className}`}>
      {children}
    </p>
  )
} 