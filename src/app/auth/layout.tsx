import { Metadata } from "next";
import { Providers } from "../providers";
import ".//../globals.css";

export const metadata: Metadata = {
  title: "ProjectHub",
  description: "Gestor de Proyectos",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
