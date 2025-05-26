'use client'          // mark this as a client component
import { ReactNode, Suspense } from 'react'
import NavBar from '@/components/NavBar'
import { ToastContainer } from 'react-toastify'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
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
