import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roommate Expense Splitter',
  description: 'Manage your shared living expenses easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
