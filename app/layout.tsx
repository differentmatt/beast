import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import Navbar from './components/Navbar';

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
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
