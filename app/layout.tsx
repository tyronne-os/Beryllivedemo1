import type { Metadata } from "next";
import "./globals.css";
import VideoPerformance from "@/components/VideoPerformance";

export const metadata: Metadata = {
  title: "Beryl Live — We need to have a face to face.",
  description: "The world's first live AI avatar platform. Photorealistic conversations. Sub-180ms. Premium.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Ensure videos never block main thread parsing */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      </head>
      <body>
        {children}
        {/* Global video + animation performance manager */}
        <VideoPerformance />
      </body>
    </html>
  );
}
