import type { Metadata } from "next";
import { Roboto, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Oh Show - シフト管理システム",
  description: "シフト提出・管理を簡単に",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${roboto.variable} ${notoSansJp.variable} sans-serif`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
