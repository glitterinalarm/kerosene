import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KÉROSÈNE — Daily Creative Releases',
  description: 'Le top 3 quotidien des sorties Graphisme, Publicité, Digital, Drop, Trend et Musique.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <div className="header-top">
            <span className="header-date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="site-title">
            {"KÉROSÈNE".split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </h1>
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
