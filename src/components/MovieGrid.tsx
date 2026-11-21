import React from 'react';
import { useApp } from '../context/AppContext';
import { MovieCard } from './MovieCard';
import { GENRE_OPTIONS } from '../utils/helpers';
import { CURATED_TOP_CARDS } from '../data/initialData';
import { Film, Sparkles, Filter, Bookmark, Crown, SearchX } from 'lucide-react';

export const MovieGrid: React.FC = () => {
  const {
    movies,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedGenre,
    setSelectedGenre,
    user
  } = useApp();

  const allAvailableMovies = movies.length > 0 ? movies : CURATED_TOP_CARDS;

  // Filter logic
  const filteredMovies = allAvailableMovies.filter((movie) => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
      const matchCast = movie.cast.some((c) => c.toLowerCase().includes(q));
      const matchLang = movie.languages.some((l) => l.toLowerCase().includes(q));
      if (!matchTitle && !matchGenre && !matchCast && !matchLang) return false;
    }

    // Category filter
    if (selectedCategory === 'movie' && movie.type !== 'movie') return false;
    if (selectedCategory === 'drama' && movie.type !== 'drama') return false;
    if (selectedCategory === 'web-series' && movie.type !== 'web-series') return false;
    if (selectedCategory === 'anime' && movie.type !== 'anime') return false;
    if (selectedCategory === 'my-list' && !user.myList.includes(movie.id)) return false;

    // Genre filter
    if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre)) return false;

    return true;
  });

  return (
    <section id="movie-grid-section" className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        
        {/* Section Title */}
        {selectedCategory !== 'All' && (
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedCategory === 'movie' && 'Movies Collection'}
              {selectedCategory === 'drama' && 'Drama Series'}
              {selectedCategory === 'web-series' && 'Web Series'}
              {selectedCategory === 'anime' && 'Anime'}
              {selectedCategory === 'my-list' && 'My Saved Watchlist'}
            </h2>
          </div>
        )}

        {/* Genre Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            id="genre-all-btn"
            onClick={() => setSelectedGenre('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGenre === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Genres
          </button>
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              id={`genre-btn-${genre}`}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 px-4">
          <div className="w-16 h-16 mx-auto bg-zinc-800/80 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/30">
            {selectedCategory === 'my-list' ? <Bookmark className="w-8 h-8 fill-current" /> : <SearchX className="w-8 h-8 text-zinc-500" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {selectedCategory === 'my-list' ? 'Your Saved List is Empty' : 'No Movies or Series Found'}
            </h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              {selectedCategory === 'my-list'
                ? 'You haven\'t saved any movies or drama series yet. Click the bookmark icon on any movie card to save it here!'
                : 'We couldn\'t find any content matching your current filters or search query. Try clearing filters or search terms.'}
            </p>
          </div>
          <button
            onClick={() => {
              if (selectedCategory === 'my-list') {
                setSelectedCategory('All');
              } else {
                setSelectedGenre('All');
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
          >
            {selectedCategory === 'my-list' ? 'Browse All Content' : 'Reset Filters'}
          </button>
        </div>
      )}

    </section>
  );
};
