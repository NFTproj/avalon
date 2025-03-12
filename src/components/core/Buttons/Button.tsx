interface ButtonProps {
  type: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  style?: React.CSSProperties
  text: string
}

function Button({
  type = 'button',
  className,
  disabled = false,
  style,
  onClick,
  text,
}: ButtonProps) {
  return (
    <div>
      <button
        type={type}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
        disabled={disabled}
        style={style}
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  )
}

export default Button
