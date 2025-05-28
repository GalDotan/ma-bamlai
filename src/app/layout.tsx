import { Suspense, ReactNode } from 'react'
import NavBar from '@/components/NavBar'
import { ToastContainer } from 'react-toastify'
import './globals.css';

export const metadata = {
  title: 'MAbmlai',
  description: 'FRC inventory system',
  themeColor: '#000000', // this sets the meta tag
}


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#000000" />
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
