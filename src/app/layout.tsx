import './globals.css';
import NavBar  from '@/components/NavBar'
import { ToastContainer } from 'react-toastify'
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body
        suppressHydrationWarning
        className="bg-surface text-white min-h-screen">
          <NavBar />
          <ToastContainer />
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
