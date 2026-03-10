export const metadata = { title: "AI Startup Lab", description: "Brainstorming startup AI-first" };
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, background: "#080808" }}>{children}</body>
    </html>
  );
}
