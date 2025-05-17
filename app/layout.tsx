import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import LeftMenu from './components/LeftMenu';

export const metadata: Metadata = {
  title: 'Beast – ASCII clone',
  description: 'A Next.js application with authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="container">
            <LeftMenu />
            <main className="main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
