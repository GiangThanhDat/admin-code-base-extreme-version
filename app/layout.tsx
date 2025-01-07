import type { Metadata } from "next";
import "devextreme/dist/css/dx.light.css";
import "./globals.css";
import { Sidebar } from "@/app/components/sidebar";

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
      {/* Build side nav here */}
      <body className="dx-viewport p-3">
        <Sidebar title="MKS Dashboard">{children}</Sidebar>
      </body>
    </html>
  );
}
