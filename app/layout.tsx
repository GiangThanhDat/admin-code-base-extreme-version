import type { Metadata } from "next";
import "./globals.css";
import "devextreme/dist/css/dx.light.css";

export const metadata: Metadata = {
  title: "ADMIN CODEBASE EXTREME VERSION",
  description: "Admin codebase extreme version using dev-extreme and NextJs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dx-viewport"> {children}</body>
    </html>
  );
}
