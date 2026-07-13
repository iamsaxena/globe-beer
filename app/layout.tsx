import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Globe",
  description: "Discover. Connect. Grow."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
