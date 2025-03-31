import '../styles/globals.css';
import type { Metadata } from 'next';
import { Libre_Baskerville, Montserrat } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';
import { PostsProvider } from '../providers/PostsProvider';
import { AuthProvider } from '../lib/authContext';

const libre = Libre_Baskerville({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-libre'
});

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: 'nytotoxNK Blog',
  description: 'A personal blog built with Next.js and Cloudflare',
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${libre.variable} ${montserrat.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <PostsProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                  {children}
                </main>
                <Footer />
              </div>
            </PostsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 