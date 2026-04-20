import type { Metadata } from 'next'
import { Inter, Manrope, Satisfy } from 'next/font/google'
import './globals.css'
import PublicLayout from '@/components/layout/PublicLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const satisfy = Satisfy({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-satisfy',
})

export const metadata: Metadata = {
  title: "ACE Voyages — Nigeria's Most Trusted Travel Partner",
  description:
    'Book flights, tours, visa assistance, and holiday packages with ACE Voyages. Based in Lekki, Lagos.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${satisfy.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  )
}
