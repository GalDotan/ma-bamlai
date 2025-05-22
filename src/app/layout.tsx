import '@/app/globals.css'
import { ReactNode } from 'react'
import ThemeToggle from '../components/ThemeToggle'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="bg-surface text-white min-h-screen"
      >
        <header className="p-4 flex justify-between items-center bg-surface shadow-lg">
          <h1 className="text-xl font-bold">FRC Inventory</h1>
          <ThemeToggle />
        </header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
