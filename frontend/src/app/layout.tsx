import type { Metadata } from 'next';
import { StoreProvider } from './StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'HealthFirst',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}