import Header from '../shared/widgets';
import './global.css';
import Providers from './Providers';


export const metadata = {
  title: 'ESHOP',
  description: 'ESHOP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html >
  )
}