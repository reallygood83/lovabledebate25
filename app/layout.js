import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// Navbar를 dynamic import로 로드하여 hydration 문제 방지
const Navbar = dynamic(() => import("./components/Navbar"), {
  ssr: false,
  loading: () => null
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "토론 튜터 - AI 기반 토론 교육 피드백 시스템",
  description: "경기초등토론교육모형에 기반한 AI 토론 교육 피드백 시스템",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
