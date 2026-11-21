import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { FeaturedHero } from './components/FeaturedHero';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailModal } from './components/MovieDetailModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { isAdminOpen, searchQuery, selectedCategory } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1">
        {isAdminOpen ? (
          <AdminPanel />
        ) : (
          <>
            {/* Top 6-7 Cards with Background Autoplay Trailer and 4.5s Auto Slide */}
            {!searchQuery && selectedCategory === 'All' && <FeaturedHero />}
            <MovieGrid />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <MovieDetailModal />
      <AppDownloadModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
