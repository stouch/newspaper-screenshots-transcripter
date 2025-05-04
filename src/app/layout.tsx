import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import './globals.css'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Newspaper Screenshots Transcripter",
  description: "Upload and transcribe newspaper pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
      className={`${inter.variable} ${robotoMono.variable} antialiased bg-red-100`}
    >
        {children}
      </body>
    </html>
  );
}
