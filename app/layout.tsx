import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Execução Orçamental 2024 - Totais Visíveis',
  description: 'Criado pelo projeto Juntos por Aveiras',
  generator: 'v0.dev',
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
