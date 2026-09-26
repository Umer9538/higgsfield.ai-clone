/**
 * Re-mounted on every navigation (unlike the layout), which is what makes it
 * the place for route entry motion: each page fades and rises in. Transform
 * and opacity only, so it never moves layout.
 */
export default function ShellTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
