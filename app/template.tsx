/** Re-mounts on every navigation, so each page arrives with a gentle rise. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
