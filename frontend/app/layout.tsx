import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/authContext/authContext";


export const metadata: Metadata = {
  title: "CareFind",
  description: "A Platform To Connect People With Doctors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
