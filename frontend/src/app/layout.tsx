import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA AI // Cloud-Based Smart Music Player",
  description: "Instant mood-based AI music streaming web application powered by AWS S3, AWS Lambda, Groq AI, and Next.js."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
