import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Dashboard | Presensi RT 05',
  description: 'Sistem Manajemen Kehadiran & Jimpitan Warga RW 11',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-row justify-between items-center py-3 sm:py-4">

              {/* Logo / Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <i className="fa-solid fa-users-viewfinder text-xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Presensi <span className="text-indigo-600">RT 05</span></h1>
                  <p className="text-xs font-medium text-slate-500 mt-1">RW 11 Dashboard</p>
                </div>
              </div>

              {/* Links */}
              <NavBar />

            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
