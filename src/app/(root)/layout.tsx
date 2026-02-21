import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ".//../globals.css";
import Navbar from "@/components/root/navbar/Navbar";
import { Providers } from "../providers";
import { ActivityLogProvider } from "@/context/ActivityLogContext";
import { ProjectDialogProvider } from "@/context/ProjectDialogContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectHub",
  description: "Gestor de Proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-br from-slate-50 via-blue-50 to-slate-100`}
      >
        <Providers>
          <ActivityLogProvider>
            <ProjectDialogProvider>
              <Navbar />
              {children}
            </ProjectDialogProvider>
          </ActivityLogProvider>
        </Providers>
      </body>
    </html>
  );
}
