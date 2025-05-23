"use client";

import '@/app/globals.css'
import { ReactNode, useState } from 'react'

import ThemeToggle from '../components/ThemeToggle'
import NavBar  from '@/components/NavBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <html lang="en">
      <head />
      <body
        suppressHydrationWarning
        className="bg-surface text-white min-h-screen">
          <NavBar onSearch={setSearchQuery} />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
