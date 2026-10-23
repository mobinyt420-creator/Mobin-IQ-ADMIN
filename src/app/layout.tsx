import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MobinIQ Admin OS | Central Command Panel",
  description: "Dedicated Standalone Admin Panel connected via Firebase Firestore & REST API Bridge",
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className="bg-[#06080f] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
