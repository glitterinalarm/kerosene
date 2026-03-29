import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import NavigationMenu from '@/components/NavigationMenu';
import { getAvailableDates } from '@/lib/rss';

export const metadata: Metadata = {
  title: 'KÉROSÈNE — Daily Creative Releases',
  description: 'Le top 3 quotidien des sorties Graphisme, Publicité, Digital, Drop, Trend et Musique.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const availableDates = await getAvailableDates();

  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <div className="header-top">
            <span className="header-date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="header-label">Directeur Artistique</span>
          </div>
          <h1 className="site-title">
            {"KÉROSÈNE".split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </h1>
          <Suspense fallback={
            <button className="menu-trigger" aria-label="Loading Menu">
              <span></span><span></span><span></span>
            </button>
          }>
            <NavigationMenu availableDates={availableDates} />
          </Suspense>
        </header>
        
        <main>
          {children}
        </main>
        
        <footer className="site-footer">
          KRSN &copy; {new Date().getFullYear()} — FUEL FOR THOUGHT.
        </footer>
      </body>
    </html>
  );
}
