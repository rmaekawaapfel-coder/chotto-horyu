import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'ちょっと保留',
  description: '送る前に一回立ち止まって、言葉を整えるためのサービス',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
