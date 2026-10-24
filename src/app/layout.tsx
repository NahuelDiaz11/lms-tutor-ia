import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'LMS POC - Tutor Virtual con IA y Voz',
  description: 'Prueba de concepto de plataforma LMS asistida por tutor de inteligencia artificial contextual y por voz.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          POC LMS con Tutor IA y Voz &bull; Evaluación Técnica
        </footer>
      </body>
    </html>
  );
}
