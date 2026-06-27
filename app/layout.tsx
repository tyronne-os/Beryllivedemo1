import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beryl Live — We need to have a face to face.",
  description: "The world's first live AI avatar platform. Photorealistic conversations. Sub-180ms. Premium.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
