import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTTH Cluster Management System | Indotek Buana Karya",
  description:
    "Sistem Terpusat Pengelolaan Kontrak FTTH, Estimasi Jasa & Material, Perhitungan Margin Otomatis, dan Monitoring Multi-Cluster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
