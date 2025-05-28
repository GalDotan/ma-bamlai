import { Suspense, ReactNode } from 'react'
import NavBar from '@/components/NavBar'
import { ToastContainer } from 'react-toastify'
import './globals.css';

export const metadata = {
  title: 'MAbmlai',
  description: 'FRC inventory system',
  themeColor: '#111827', // this sets the meta tag
}


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#111827" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-surface text-white min-h-screen">
          <Suspense fallback={null}>
            <NavBar />
          </Suspense>
          <Suspense fallback={null}>
            <ToastContainer />
          </Suspense>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
