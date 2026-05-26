import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/Themes/ThemeProvider";
import "./globals.css";
import { AuthProvider } from "@/authContext/authContext";
import { Toaster } from "sonner";
import AuthEventHandler from "@/components/pageComponents/authEventhandler";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "CareFind — Smarter Healthcare",
  description:
    "AI-powered symptom analysis and intelligent doctor matching. Find the right specialist near you — instantly.",
  metadataBase: new URL(siteUrl),
  applicationName: "CareFind",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "CareFind — Smarter Healthcare",
    description:
      "AI-powered symptom analysis and intelligent doctor matching. Find the right specialist near you — instantly.",
    url: "https://carefind.vercel.app",
    siteName: "CareFind",
    type: "website",
    locale: "en_US",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareFind — Smarter Healthcare",
    description:
      "AI-powered symptom analysis and intelligent doctor matching. Find the right specialist near you — instantly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="LnKdFIUnYiWkSAZ8gLFRBvsFmk4Ddg2yrL92uMva9cc" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>

          <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthEventHandler/>
          {children}
            <Toaster
              richColors
              position="top-right"
              closeButton
            />
        </ThemeProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
