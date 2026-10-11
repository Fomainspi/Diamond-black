import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Diamond Black Corporation",
    template: "%s | Diamond Black Corporation"
  },
  description:
    "Building connections, innovation, and business opportunities through strategic networking, digital media, and corporate events.",
  applicationName: "Diamond Black Corporation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}