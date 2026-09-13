/**
 * Higgsfield mark: two interlocking strokes forming the swirl.
 * Inherits currentColor so it works on any surface.
 */
export function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Higgsfield"
    >
      <path
        d="M4.5 20.8c0-4.6 3.2-8.3 7.3-8.3 2.9 0 5 1.7 6.5 4l2.7 4.1c1.2 1.8 2.3 2.7 3.9 2.7 2 0 3.4-1.6 3.4-3.7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27.5 11.2c0 4.6-3.2 8.3-7.3 8.3-2.9 0-5-1.7-6.5-4l-2.7-4.1c-1.2-1.8-2.3-2.7-3.9-2.7-2 0-3.4 1.6-3.4 3.7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
