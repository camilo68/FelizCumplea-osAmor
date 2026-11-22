type IconProps = {
  className?: string
}

export function LockIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M7.5 10V7.8a4.5 4.5 0 0 1 9 0V10M5.5 10h13v10h-13V10Zm6.5 4v2"
      />
    </svg>
  )
}

export function UnlockIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M7.5 10V7.8a4.5 4.5 0 0 1 8.7-1.5M5.5 10h13v10h-13V10Zm6.5 4v2"
      />
    </svg>
  )
}

export function CheckIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m5 12.5 4.5 4.5L19 7.5"
      />
    </svg>
  )
}

export function ArrowIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M12 5v14m0 0-5-5m5 5 5-5"
      />
    </svg>
  )
}

export function StarIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.5 9.4l6.6-.9 2.9-6Z"
      />
    </svg>
  )
}

export function HeartIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 21.1s-7.7-4.6-9.8-9.2C.7 8.2 2.6 4.6 6.1 4c2.1-.4 4 .6 5.1 2.2C12.3 4.6 14.2 3.6 16.3 4c3.5.6 5.4 4.2 3.9 7.9-2.1 4.6-9.8 9.2-9.8 9.2Z"
      />
    </svg>
  )
}

export function SparkleIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 1.8c.7 4.6 2.4 6.6 7 7.3-4.6.8-6.3 2.7-7 7.3-.7-4.6-2.4-6.5-7-7.3 4.6-.7 6.3-2.7 7-7.3Zm6.4 12.6c.4 2.4 1.3 3.5 3.7 3.9-2.4.4-3.3 1.5-3.7 3.9-.4-2.4-1.3-3.5-3.7-3.9 2.4-.4 3.3-1.5 3.7-3.9Z"
      />
    </svg>
  )
}
