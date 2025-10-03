import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Welcome to egbay',
  description: 'Egbay is an e-commerce platform for buying and selling products online.',
  generator: 'egbay/ nextjs',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
