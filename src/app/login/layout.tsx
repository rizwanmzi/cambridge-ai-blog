export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the main layout padding — login page is full-screen
  return <div className="fixed inset-0 z-50">{children}</div>;
}
