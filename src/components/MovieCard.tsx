import React from 'react';
import { MovieItem } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Bookmark, Check, MessageSquare, Eye } from 'lucide-react';

interface MovieCardProps {
  movie: MovieItem;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { setSelectedMovie, user, toggleMyList, comments } = useApp();

  const isBookmarked = user.myList.includes(movie.id);
  const movieCommentsCount = comments.filter(c => c.movieId === movie.id).length;

  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => setSelectedMovie(movie)}
      className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 cursor-pointer flex flex-col transform hover:-translate-y-1"
    >
      {/* Poster Image Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges / Bookmark Button */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex items-center justify-end pointer-events-none z-20">

          {/* Bookmark Icon Button */}
          <button
            id={`bookmark-btn-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMyList(movie.id);
            }}
            className={`pointer-events-auto p-1 sm:p-1.5 rounded-full backdrop-blur-md transition-all duration-200 border flex items-center justify-center shadow-md ${
              isBookmarked
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold'
                : 'bg-zinc-950/80 hover:bg-blue-600 text-white border-zinc-700/60'
            }`}
            title={isBookmarked ? 'Remove from Saved' : 'Save to Watchlist'}
          >
            {isBookmarked ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            ) : (
              <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-none" />
            )}
          </button>
        </div>

        {/* Hover Overlay with Play Icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Movie Info Section */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between space-y-1 sm:space-y-2">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-zinc-400 mb-0.5 sm:mb-1">
            <span className="text-zinc-400 font-medium">{movie.releaseYear}</span>
            <span>{movie.duration}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
            {movie.title}
          </h3>

          <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {movie.genres.join(', ')}
          </p>
        </div>

        {/* Bottom Specs */}
        <div className="pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400">
          <span className="truncate max-w-[100px] sm:max-w-[130px]">{movie.genres[0] || 'Entertainment'}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40" title="Total Views">
              <Eye className="w-2.5 h-2.5 text-emerald-400" />
              {movie.viewsCount ?? 0}
            </span>
            {movieCommentsCount > 0 && (
              <span className="flex items-center gap-1 text-sky-400 font-semibold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">
                <MessageSquare className="w-2.5 h-2.5" />
                {movieCommentsCount}
              </span>
            )}
            <span>{movie.releaseYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
