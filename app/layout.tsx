import './globals.css';
import { Inter, Space_Grotesk, Satoshi } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const satoshi = Satoshi({ subsets: ['latin'], weight: '400', variable: '--font-satoshi' });

export const metadata = {
  title: 'Nexus Core OS - Profile Dashboard',
  description: 'Futuristic AI command center UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${satoshi.variable}`}>
      <body className="bg-[#020304] text-[#f8fafc] min-h-screen selection:bg-cyan-500/30 font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
