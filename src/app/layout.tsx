import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "五粮液 AI排菜系统 | Tokyo",
  description: "五粮液東京 高端中餐AI菜单规划系统 - AIメニュープランニングシステム",
  keywords: ["五粮液", "中餐", "东京", "AI菜单", "高端餐厅", "メニュー"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0d0d]">{children}</body>
    </html>
  );
}
