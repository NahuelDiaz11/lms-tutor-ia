import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Class-Edtech Learning | Tutor Virtual con IA y Voz',
  description: 'Plataforma Class-Edtech Learning asistida por tutor de inteligencia artificial contextual y por voz.',
  icons: {
    icon: '/logo.png',
  },
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>&copy; {new Date().getFullYear()} <strong>Class-Edtech Learning</strong> &bull; Todos los derechos reservados</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-indigo-600 font-medium">ww.classedtech.com.co</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
