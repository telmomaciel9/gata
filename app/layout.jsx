import './globals.css' // <--- ISTO TEM DE ESTAR AQUI

export const metadata = {
  title: 'Gata na Praia 2026',
  description: 'Resultados em tempo real',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="antialiased">{children}</body>
    </html>
  )
}