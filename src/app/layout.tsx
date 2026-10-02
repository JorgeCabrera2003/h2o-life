import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';
import { AnalyticsTracker } from '@/components/common/AnalyticsTracker';
import { FloatingWhatsAppButton } from '@/components/common/FloatingWhatsAppButton';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://h2olife.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'H2O Life | Agua Purificada & Punto de Venta Inteligente - Barquisimeto',
    template: '%s | H2O Life',
  },
  description:
    'H2O Life en Barquisimeto: Agua 100% purificada por ósmosis inversa y ozono, recargas de botellones de 20L, helados artesanales, snacks y punto de venta PWA de alta velocidad en Calle 28 con Carrera 25.',
  keywords: [
    'agua purificada Barquisimeto',
    'recarga botellon agua Barquisimeto',
    'h2o life',
    'calle 28 carrera 25',
    'agua mineral ozonizada Lara',
    'punto de venta agua Barquisimeto',
    'delivery botellon lara',
    'botellon 20 litros Barquisimeto',
    'Freyeliz agua purificada',
    'TSU Jorge Cabrera',
  ],
  authors: [{ name: 'TSU Jorge Cabrera' }, { name: 'Freyeliz' }],
  creator: 'TSU Jorge Cabrera',
  publisher: 'H2O Life C.A.',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    url: siteUrl,
    siteName: 'H2O Life Purified Water',
    title: 'H2O Life | Agua Purificada & Punto de Venta Inteligente',
    description:
      'Punto de venta y despacho de agua purificada, recargas de botellones de 20L y productos en Barquisimeto. Calle 28 con Carrera 25.',
    images: [
      {
        url: '/favicon.svg',
        width: 512,
        height: 512,
        alt: 'Logotipo de H2O Life Agua Purificada en Barquisimeto',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'H2O Life | Agua Purificada & POS Inteligente',
    description:
      'Recargas de botellones de 20L y despacho en Barquisimeto. Calle 28 con Carrera 25.',
    images: ['/favicon.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'H2O Life',
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
};

// Schema.org Structured Data (JSON-LD)
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'Store'],
      '@id': `${siteUrl}/#business`,
      name: 'H2O Life Purified Water',
      legalName: 'H2O Life C.A.',
      taxID: 'J-50982341-2',
      description:
        'Empresa procesadora y distribuidora de agua 100% purificada por ósmosis inversa, microfiltración y ozono. Recargas de botellones, venta de insumos, snacks y helados.',
      url: siteUrl,
      telephone: '+58-412-1234567',
      priceRange: '$',
      currenciesAccepted: 'USD, VES',
      paymentAccepted: 'Cash, Debit Card, Pago Movil, Zelle',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle 28 con Carrera 25',
        addressLocality: 'Barquisimeto',
        addressRegion: 'Lara',
        postalCode: '3001',
        addressCountry: 'VE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 10.07125,
        longitude: -69.32705,
      },
      hasMap: 'https://www.google.com/maps/search/?api=1&query=10.07125,-69.32705',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '08:00',
          closes: '14:00',
        },
      ],
      areaServed: {
        '@type': 'City',
        name: 'Barquisimeto',
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/#catalog`,
      name: 'Catálogo Principal de Agua & Insumos H2O Life',
      itemListElement: [
        {
          '@type': 'Product',
          position: 1,
          name: 'Recarga de Botellón 20L',
          description: 'Agua pura microfiltrada y ozonizada en botellón retornable de 20 litros.',
          offers: {
            '@type': 'Offer',
            price: '1.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        },
        {
          '@type': 'Product',
          position: 2,
          name: 'Botellón Nuevo 20L con Agua Purificada',
          description: 'Envase de policarbonato virgen de 20 litros sellado de fábrica con agua ozonizada.',
          offers: {
            '@type': 'Offer',
            price: '8.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        },
        {
          '@type': 'Product',
          position: 3,
          name: 'Botella Agua Mineral 500ml',
          description: 'Botella deportiva portátil con agua purificada.',
          offers: {
            '@type': 'Offer',
            price: '0.50',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 select-none overflow-x-hidden">
        {/* Telemetría y Analítica */}
        <AnalyticsTracker />

        {/* Contenido principal de la aplicación */}
        {children}

        {/* Concierge flotante de WhatsApp permanente */}
        <FloatingWhatsAppButton />

        {/* Banner de consentimiento de cookies y almacenamiento local */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
