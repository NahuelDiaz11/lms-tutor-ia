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
      <body className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#071D3F] antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        {/* Franja Inferior Azul Marino #071D3F */}
        <footer className="bg-[#071D3F] text-white py-5 px-4 text-center text-xs border-t-4 border-[#EB0202]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Class-Edtech" className="w-6 h-6 object-contain" />
              <span>&copy; {new Date().getFullYear()} <strong className="text-white">Class-Edtech Learning</strong> &bull; Todos los derechos reservados</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-300">Plataforma EdTech de Aprendizaje</span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <a
                href="https://ww.classedtech.com.co"
                target="_blank"
                rel="noreferrer"
                className="text-[#EB0202] hover:text-white font-bold transition font-mono"
              >
                ww.classedtech.com.co
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
