import { Quantico } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

// Load Quantico font directly
const quantico = Quantico({ 
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '0xGasless AgentKit Chat',
  description: 'Chat interface for 0xGasless AgentKit to try all actions of the 0xgasless agentkit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quantico.className}>{children}</body>
    </html>
  );
}
