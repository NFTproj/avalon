// components/core/Accordion.tsx
import { cn } from '@/utils/cn'
import { useState, ReactNode } from 'react'

type AccordionProps = {
  title: ReactNode
  children: ReactNode
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  iconOpen?: ReactNode
  iconClosed?: ReactNode
  titleClassName?: string
  titleStyle?: React.CSSProperties
  contentClassName?: string
  contentStyle?: React.CSSProperties
  className?: string
  accordionClassName?: string
  accordionStyle?: React.CSSProperties
  alwaysOpen?: boolean
  emptyIcon?: boolean
}

const defaultIconOpen = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
)

const defaultIconClosed = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
)

export const Accordion = ({
  title,
  children,
  isOpen: propsIsOpen,
  onToggle,
  iconOpen = defaultIconOpen,
  iconClosed = defaultIconClosed,
  titleClassName,
  contentClassName,
  contentStyle,
  className,
  accordionClassName,
  accordionStyle,
  alwaysOpen = false,
  emptyIcon = false,
}: AccordionProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  const isControlled = typeof propsIsOpen !== 'undefined'
  const open = isControlled ? propsIsOpen : internalIsOpen

  const handleToggle = () => {
    if (!isControlled) {
      setInternalIsOpen(alwaysOpen ? true : !internalIsOpen)
    }
    onToggle?.(!open)
  }

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex justify-between items-center py-4 focus:outline-none bg-gray-800',
          {
            [String(accordionClassName)]: accordionClassName,
            'rounded-b-none': open,
          },
        )}
        style={accordionStyle}
      >
        <div
          className={cn('text-white text-lg font-medium', {
            [String(titleClassName)]: titleClassName,
          })}
        >
          {title}
        </div>
        {emptyIcon ? null : (
          <span className={titleClassName}>{open ? iconOpen : iconClosed}</span>
        )}
      </button>

      {open && (
        <div
          className={cn('text-white pb-4 bg-gray-800', {
            [String(contentClassName)]: contentClassName,
            'rounded-t-none': open,
          })}
          style={contentStyle}
        >
          {children}
        </div>
      )}
    </div>
  )
}
