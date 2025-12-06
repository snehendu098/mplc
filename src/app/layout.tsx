import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SRGG Marketplace',
  description: 'Quantified, Insured, Hedged & Tokenized Commodity Trading Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
