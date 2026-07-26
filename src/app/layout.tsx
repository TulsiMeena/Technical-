import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS | AI Operating System",
  description: "Personal AI Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-full w-full flex flex-col m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
