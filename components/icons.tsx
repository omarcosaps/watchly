type IconProps = {
  className?: string
}

export const SearchIcon = ({ className = "h-4 w-4" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export const FilterIcon = ({ className = "h-4 w-4" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const HomeIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4.5 11.2 12 5l7.5 6.2V19a1.5 1.5 0 0 1-1.5 1.5h-3.5V15h-5v5.5H6A1.5 1.5 0 0 1 4.5 19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const CompassIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m14.8 9.2-1.2 4.4-4.4 1.2 1.2-4.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const BookmarkIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M7 3.75h10A1.25 1.25 0 0 1 18.25 5v15.1l-6.25-3.4-6.25 3.4V5A1.25 1.25 0 0 1 7 3.75z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export const SlidersIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 7h10M18 7h2M4 17h2M8 17h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export const LogoutIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 12h10M11 9l3 3-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const ChevronIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const PlusIcon = ({ className = "h-4 w-4" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const CheckIcon = ({ className = "h-4 w-4" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m5 12 5 5 9-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const MenuIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const CloseIcon = ({ className = "h-5 w-5" }: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m7 7 10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const StarIcon = ({
  className = "h-3.5 w-3.5",
  filled = false,
}: IconProps & { filled?: boolean }) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m12 3.6 2.47 5.36 5.83.64-4.36 3.9 1.2 5.72L12 16.4l-5.14 2.82 1.2-5.72-4.36-3.9 5.83-.64z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
