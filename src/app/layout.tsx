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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pp-two7-store.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'P-Two7 Store | ptwo7 | storeptwo7 — ហាងឌីជីថលលក់ Product Key & Software',
    template: '%s | P-Two7 Store (ptwo7)',
  },
  description: 'P-Two7 Store (ptwo7 / storeptwo7) — ហាងលក់ Product Key សុទ្ធ 100%, Windows 11 Pro, Office 2024, Adobe Photoshop, IDM, Antivirus និងទាញយក Software Files លឿនរហ័ស ធានាគុណភាពនៅកម្ពុជា។',
  keywords: [
    'P-Two7 Store',
    'ptwo7',
    'storeptwo7',
    'pp-two7-store',
    'pp-two7-store.vercel.app',
    'ptwo7 store',
    'P-Two7',
    'PTwo7',
    'P-Two7 stroe',
    'p-two7',
    'store ptwo7',
    'Windows 11 Pro Key',
    'Microsoft Office 2024 Key',
    'Adobe Photoshop',
    'IDM Key',
    'Antivirus Key',
    'Product Key Cambodia',
    'Digital Store Cambodia',
  ],
  authors: [{ name: 'P-Two7 Store', url: APP_URL }],
  creator: 'P-Two7 Store (ptwo7)',
  publisher: 'P-Two7 Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'P-Two7 Store (ptwo7 / storeptwo7) — ហាងឌីជីថលលក់ Product Key & Files',
    description: 'ទិញ Product Key, Software License Keys និងទាញយក Digital Files គុណភាពខ្ពស់ ផ្តល់ជូនភ្លាមៗ ធានាស្របច្បាប់ 100% ក្នុងប្រទេសកម្ពុជា។',
    url: APP_URL,
    siteName: 'P-Two7 Store (ptwo7)',
    images: [
      {
        url: '/hero-full-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'P-Two7 Store Showcase',
      },
    ],
    locale: 'km_KH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'P-Two7 Store (ptwo7 / storeptwo7)',
    description: 'ទិញ Product Key & Software Files គុណភាពខ្ពស់ ធានាស្របច្បាប់ 100% — P-Two7 Store',
    images: ['/hero-full-banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '5IGI7gy16po_v9uPUpNp_d2gb0jVrk0_2JGB7dD91y0',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'P-Two7 Store',
      alternateName: ['ptwo7', 'storeptwo7', 'pp-two7-store', 'P-Two7 stroe', 'P-Two7', 'PTwo7', 'ptwo7 store'],
      description: 'ហាងឌីជីថលលក់ Product Key, Software License Keys និង Digital Files ស្របច្បាប់នៅកម្ពុជា',
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${APP_URL}/products?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'km',
    },
    {
      '@type': 'Store',
      '@id': `${APP_URL}/#store`,
      name: 'P-Two7 Store',
      alternateName: ['ptwo7', 'storeptwo7', 'pp-two7-store', 'P-Two7 stroe', 'PTwo7'],
      url: APP_URL,
      logo: `${APP_URL}/hero-slide-1.jpg`,
      image: `${APP_URL}/hero-full-banner.jpg`,
      description: 'P-Two7 Store ផ្តល់ជូន Product Key និង Software Files គុណភាពខ្ពស់ ធានា 100%',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KH',
      },
    },
  ],
};

import { ThemeProvider } from '@/context/ThemeContext';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" suppressHydrationWarning className={`dark ${notoSansKhmer.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="google-site-verification" content="5IGI7gy16po_v9uPUpNp_d2gb0jVrk0_2JGB7dD91y0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-dark-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white font-khmer pb-16 lg:pb-0 transition-colors duration-300">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <MobileBottomNav />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

