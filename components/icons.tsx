type IconProps = {
  className?: string
}

export const WatchlyMark = ({ className = "h-7 w-7" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M30.585 39.9635V56.205C30.585 56.8276 30.338 57.4247 29.8984 57.8649C29.4587 58.3051 28.8624 58.5525 28.2406 58.5525C27.6189 58.5525 27.0226 58.3051 26.5829 57.8649C26.1433 57.4247 25.8963 56.8276 25.8963 56.205V39.986C26.549 40.4632 27.3317 40.7297 28.1397 40.7497C29.0205 40.7749 29.8835 40.4975 30.585 39.9635ZM50.5514 35.2685C49.9564 35.2685 49.3858 35.5052 48.9651 35.9265C48.5443 36.3477 48.308 36.9191 48.308 37.5149V40.3454C48.308 40.968 48.555 41.5651 48.9946 42.0053C49.4343 42.4456 50.0306 42.6929 50.6523 42.6929C51.2741 42.6929 51.8704 42.4456 52.3101 42.0053C52.7497 41.5651 52.9967 40.968 52.9967 40.3454V37.6272C53.0142 37.3051 52.9621 36.983 52.8442 36.6828C52.7262 36.3827 52.545 36.1115 52.313 35.8876C52.081 35.6638 51.8035 35.4927 51.4996 35.3859C51.1956 35.279 50.8722 35.239 50.5514 35.2685ZM20.8037 46.1186C19.9965 46.0944 19.215 45.8284 18.5603 45.3549V61.6413C18.5603 62.2668 18.8085 62.8668 19.2502 63.3091C19.692 63.7515 20.2911 64 20.9159 64C21.5406 64 22.1398 63.7515 22.5815 63.3091C23.0233 62.8668 23.2715 62.2668 23.2715 61.6413V45.4672C22.5389 45.9413 21.6745 46.1695 20.8037 46.1186ZM43.2379 30.3938C42.934 30.3786 42.6301 30.4254 42.3449 30.5315C42.0596 30.6375 41.7988 30.8006 41.5785 31.0107C41.3582 31.2208 41.1828 31.4737 41.0631 31.7538C40.9434 32.0339 40.8819 32.3355 40.8823 32.6402V45.1527C40.8823 45.7783 41.1305 46.3782 41.5722 46.8206C42.014 47.2629 42.6131 47.5114 43.2379 47.5114C43.8626 47.5114 44.4618 47.2629 44.9035 46.8206C45.3453 46.3782 45.5934 45.7783 45.5934 45.1527V32.7975C45.6113 32.4733 45.5588 32.1491 45.4395 31.8471C45.3203 31.5452 45.137 31.2728 44.9025 31.0486C44.6679 30.8244 44.3876 30.6538 44.0809 30.5485C43.7741 30.4432 43.4483 30.4058 43.1257 30.4388L43.2379 30.3938ZM35.7897 35.2011C34.9447 35.1953 34.1221 34.9286 33.4341 34.4373V50.7687C33.4341 51.3943 33.6823 51.9942 34.1241 52.4366C34.5658 52.8789 35.165 53.1274 35.7897 53.1274C36.4145 53.1274 37.0136 52.8789 37.4554 52.4366C37.8971 51.9942 38.1453 51.3943 38.1453 50.7687V34.4598C37.4336 34.9907 36.5648 35.2675 35.6776 35.2461L35.7897 35.2011ZM15.7112 47.7136V2.08915C15.7053 1.53302 15.4805 1.00168 15.0856 0.610523C14.6908 0.219363 14.1578 -3.14691e-05 13.6024 3.3856e-09H13.1088C12.5534 -3.14691e-05 12.0204 0.219363 11.6255 0.610523C11.2307 1.00168 11.0059 1.53302 11 2.08915V47.7136C11 48.2736 11.2222 48.8107 11.6177 49.2067C12.0131 49.6027 12.5495 49.8252 13.1088 49.8252H13.6024C14.1617 49.8252 14.698 49.6027 15.0935 49.2067C15.489 48.8107 15.7112 48.2736 15.7112 47.7136ZM21.0505 44.3889H20.5569C19.9977 44.3889 19.4613 44.1664 19.0658 43.7704C18.6703 43.3744 18.4481 42.8373 18.4481 42.2773V7.52545C18.454 6.96932 18.6788 6.43797 19.0737 6.04681C19.4685 5.65565 20.0015 5.43627 20.5569 5.4363H21.0505C21.6059 5.43627 22.1389 5.65565 22.5338 6.04681C22.9286 6.43797 23.1534 6.96932 23.1593 7.52545V42.3222C23.1593 42.5995 23.1048 42.8741 22.9988 43.1303C22.8928 43.3865 22.7375 43.6193 22.5416 43.8154C22.3458 44.0114 22.1134 44.167 21.8575 44.2731C21.6016 44.3792 21.3274 44.4338 21.0505 44.4338V44.3889ZM28.4762 39.0425H27.9602C27.4069 39.0425 26.8762 38.8224 26.4849 38.4306C26.0937 38.0388 25.8738 37.5074 25.8738 36.9533V12.9168C25.8709 12.6406 25.9226 12.3665 26.0262 12.1104C26.1297 11.8544 26.2829 11.6214 26.4769 11.425C26.671 11.2286 26.902 11.0727 27.1566 10.9663C27.4112 10.86 27.6843 10.8052 27.9602 10.8052H28.4762C29.0316 10.8111 29.5622 11.0362 29.9529 11.4316C30.3435 11.8269 30.5626 12.3606 30.5626 12.9168V36.9533C30.5626 37.5074 30.3428 38.0388 29.9515 38.4306C29.5602 38.8224 29.0295 39.0425 28.4762 39.0425ZM35.9019 33.5388H35.4308C34.8753 33.5388 34.3423 33.3194 33.9475 32.9283C33.5527 32.5371 33.3279 32.0058 33.322 31.4496V18.5104C33.3035 18.2219 33.3445 17.9328 33.4421 17.6608C33.5398 17.3889 33.6923 17.1399 33.8899 16.9293C34.0876 16.7187 34.3264 16.551 34.5914 16.4366C34.8565 16.3221 35.1421 16.2634 35.4308 16.264H35.9243C36.4836 16.264 37.02 16.4864 37.4155 16.8824C37.811 17.2784 38.0331 17.8155 38.0331 18.3756V31.4047C38.0361 31.6839 37.9837 31.9609 37.8791 32.2197C37.7745 32.4785 37.6196 32.7139 37.4235 32.9124C37.2273 33.1109 36.9939 33.2684 36.7366 33.3759C36.4792 33.4835 36.2032 33.5388 35.9243 33.5388H35.9019ZM43.35 28.709H42.8565C42.2972 28.709 41.7608 28.4865 41.3653 28.0905C40.9698 27.6945 40.7477 27.1574 40.7477 26.5974V23.2503C40.7536 22.6941 40.9784 22.1628 41.3732 21.7716C41.768 21.3805 42.3011 21.1611 42.8565 21.1611H43.35C43.9055 21.1611 44.4385 21.3805 44.8333 21.7716C45.2281 22.1628 45.4529 22.6941 45.4588 23.2503V26.5974C45.4589 27.1536 45.2398 27.6873 44.8491 28.0827C44.4585 28.478 43.9279 28.7031 43.3725 28.709H43.35Z"
        fill="currentColor"
      />
    </svg>
  )
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
