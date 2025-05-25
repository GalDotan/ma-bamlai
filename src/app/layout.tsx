import '@/app/globals.css'
import { ReactNode } from 'react'

import NavBar  from '@/components/NavBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body
        suppressHydrationWarning
        className="bg-surface text-white min-h-screen">
          <NavBar />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
