import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Ultra-Simple AI Expense Tracker",
  description: "Track expenses with natural language and instant insights."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
