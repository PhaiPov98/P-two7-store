import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Khmer, Inter, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TopProgressBar from '@/components/layout/TopProgressBar';


const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ['khmer'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-khmer',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080C16',
};

export const metadata: Metadata = {
  title: 'P-Two7 Digital Store — ហាងឌីជីថលលក់ Product Key និង Files Download',
  description: 'ទិញ Product Key, Software License Keys និងទាញយក Digital Files គុណភាពខ្ពស់ ផ្តល់ជូនភ្លាមៗ ធានាស្របច្បាប់ 100% ក្នុងប្រទេសកម្ពុជា។',
  keywords: 'Windows 11 Pro Key, Microsoft Office 2024, Adobe Photoshop, IDM Key, Antivirus, Product Key Cambodia, P-Two7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className={`dark ${notoSansKhmer.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-dark-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white font-khmer">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>

  );
}

