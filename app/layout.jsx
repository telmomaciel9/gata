import './globals.css' // <-- ESTA LINHA É A CHAVE PARA A PARTE VISUAL

export const metadata = {
  title: 'Gata na Praia 2026',
  description: 'Resultados em tempo real',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}