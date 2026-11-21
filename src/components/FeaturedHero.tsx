import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CURATED_TOP_CARDS } from '../data/initialData';
import { MovieItem } from '../types';
import { getAutoplayTrailerUrl } from '../utils/helpers';
import { trackGAEvent } from '../lib/analytics';
import {
  Play,
  Send,
  Star,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Check,
  Tv,
  Film,
  Eye
} from 'lucide-react';

const AUTO_SLIDE_DURATION_MS = 10000; // 10 seconds per card auto slide
const TICK_INTERVAL_MS = 50; // Progress bar tick update

export const FeaturedHero: React.FC = () => {
  const { movies, setSelectedMovie, settings, user, toggleMyList } = useApp();

  // Combine movies from database + curated initial cards to guarantee 6 to 7 top cards
  // When 'isNew' is checked in Admin, it is prioritized right at the top of the 7 cards
  const topCards: MovieItem[] = useMemo(() => {
    // 1. Any movie marked as 'isNew' in admin comes first
    const newFromDb = movies.filter((m) => m.isNew);
    // 2. Movies marked as 'isFeatured' come next
    const featuredFromDb = movies.filter((m) => m.isFeatured && !m.isNew);
    // 3. Other remaining movies from database
    const regularFromDb = movies.filter((m) => !m.isNew && !m.isFeatured);

    const combined: MovieItem[] = [...newFromDb, ...featuredFromDb, ...regularFromDb];

    // If still fewer than 7, complement with curated blockbuster movies/dramas
    for (const curated of CURATED_TOP_CARDS) {
      if (combined.length >= 7) break;
      if (!combined.some((item) => item.id === curated.id || item.title.toLowerCase() === curated.title.toLowerCase())) {
        combined.push(curated);
      }
    }

    return combined.slice(0, 7);
  }, [movies]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted] = useState(true); // Muted by default so browsers allow seamless autoplay
  const [isTrailerActive] = useState(true); // Trailer video playing in background
  const [isPaused, setIsPaused] = useState(false); // Paused on hover or manual pause
  const [progress, setProgress] = useState(0); // 0 to 100%

  // References for timing
  const progressRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalCards = topCards.length;
  const current = topCards[currentIndex] || topCards[0] || CURATED_TOP_CARDS[0];
  const isBookmarked = user.myList.includes(current?.id);

  // Auto-slide 4.5 seconds timer with progress bar
  useEffect(() => {
    if (totalCards <= 1) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isPaused) return;

    const step = (TICK_INTERVAL_MS / AUTO_SLIDE_DURATION_MS) * 100;

    timerRef.current = setInterval(() => {
      progressRef.current += step;
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % totalCards);
      } else {
        setProgress(progressRef.current);
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, totalCards]);

  // Reset progress on slide change
  const goToSlide = (index: number) => {
    progressRef.current = 0;
    setProgress(0);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    goToSlide((currentIndex + 1) % totalCards);
  };

  const handlePrev = () => {
    goToSlide((currentIndex - 1 + totalCards) % totalCards);
  };

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 40) {
      // Swiped left -> Next
      handleNext();
    } else if (diff < -40) {
      // Swiped right -> Prev
      handlePrev();
    }
    touchStartX.current = null;
  };

  if (!current || totalCards === 0) return null;

  // Background trailer URL with autoplay, mute, and loop
  const backgroundTrailerUrl = isTrailerActive ? getAutoplayTrailerUrl(current.trailerUrl, isMuted) : '';

  return (
    <section
      id="featured-hero-carousel"
      className="relative w-full bg-zinc-950 overflow-hidden select-none border-b border-zinc-800/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 10s Auto-Slide Linear Progress Indicator Bar at Very Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/60 z-30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Showcase Hero Container (+20% height/motu: Mobile min-h-[250px], Desktop min-h-[445px]) */}
      <div className="relative w-full min-h-[250px] sm:min-h-[350px] md:min-h-[410px] lg:min-h-[445px] flex flex-col justify-between">
        
        {/* ================= BACKGROUND LAYER (DIRECT LIGHT TRAILER AUTO PLAY WITHOUT PHOTO & CROPPED YOUTUBE CHANNEL HEADER) ================= */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-zinc-950">
          
          {/* Autoplaying Trailer Video Player - YouTube Channel Avatar/Profile Header Hidden by cropping top (-top-[18%] to -top-[24%]) */}
          {backgroundTrailerUrl && (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                key={`hero-trailer-${current.id}`}
                src={backgroundTrailerUrl}
                title={`Trailer for ${current.title}`}
                className="absolute -top-[18%] sm:-top-[22%] left-1/2 -translate-x-1/2 w-[140%] sm:w-[125%] h-[155%] sm:h-[160%] min-w-full min-h-full object-cover border-0 filter brightness-105 contrast-100 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Soft Gradient: top is clear so trailer is vivid, bottom softly protects mini name and buttons */}
          <div className="hidden sm:block absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-zinc-950/85 via-zinc-950/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 sm:h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
        </div>

        {/* Spacer for clean compact top padding */}
        <div className="pt-2 sm:pt-3" />

        {/* ================= MAIN CONTENT: 20% MOTU NAME & DETAILS ================= */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-4.5 md:py-6 flex flex-col justify-end">
          
          <div className="max-w-xl lg:max-w-2xl space-y-1 sm:space-y-2">
            
            {/* Badges Bar: Type, Rating, Year, Duration */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[10px] font-bold">
              
              {/* Type Category Badge */}
              <span className="bg-blue-600 text-white px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded uppercase tracking-wider font-extrabold text-[8.5px] sm:text-[9.5px] shadow-sm flex items-center gap-1">
                {current.type === 'movie' ? <Film className="w-2.5 h-2.5" /> : <Tv className="w-2.5 h-2.5" />}
                {current.type.toUpperCase()}
              </span>

              {/* Rating with Star */}
              <span className="flex items-center gap-0.5 sm:gap-1 text-amber-400 bg-zinc-900/90 border border-zinc-700/80 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                <span>{current.rating}</span>
                <span className="text-zinc-500 text-[7.5px] sm:text-[8.5px]">/10</span>
              </span>

              {/* Release Year */}
              <span className="bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded backdrop-blur-sm">
                {current.releaseYear}
              </span>

              {/* Seasons or Duration */}
              <span className="bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded backdrop-blur-sm font-medium">
                {current.duration}
              </span>

              {/* Languages (hidden on very small screens to keep mobile clean) */}
              <span className="hidden sm:inline-block bg-zinc-900/80 border border-zinc-700/80 text-sky-400 px-2 py-0.5 rounded backdrop-blur-sm">
                {current.languages.join(' • ')}
              </span>

              {/* Views */}
              {current.viewsCount !== undefined && (
                <span className="hidden sm:flex items-center gap-1 text-emerald-400 bg-zinc-900/80 border border-emerald-900/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  <Eye className="w-2.5 h-2.5" />
                  <span>{current.viewsCount.toLocaleString()}</span>
                </span>
              )}

            </div>

            {/* Movie / Series Name */}
            <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-1">
              {current.title}
            </h1>

            {/* Original / Alternate Name (Desktop only) */}
            {current.originalTitle && current.originalTitle !== current.title && (
              <p className="hidden sm:block text-[10px] text-zinc-300 font-medium italic -mt-0.5 drop-shadow-md">
                Original Title: {current.originalTitle}
              </p>
            )}

            {/* Genres Tag Cloud */}
            <div className="flex flex-wrap items-center gap-1 text-[8.5px] sm:text-[9.5px] text-zinc-300">
              {current.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="bg-zinc-900/90 text-zinc-200 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded border border-zinc-800 backdrop-blur-sm font-semibold shadow-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Synopsis / Story Description */}
            <p className="text-zinc-200 text-[10px] sm:text-xs md:text-sm leading-snug line-clamp-1 sm:line-clamp-2 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
              {current.description}
            </p>

            {/* Cast / Stars (Desktop only for compactness) */}
            {current.cast && current.cast.length > 0 && (
              <div className="hidden sm:flex text-[9.5px] sm:text-[10.5px] text-zinc-300 items-center gap-1 flex-wrap drop-shadow">
                <span className="text-zinc-400 font-semibold uppercase text-[8.5px]">Starring:</span>
                <span className="text-zinc-200 font-medium">{current.cast.join(', ')}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-0.5 sm:pt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              
              {/* Watch Trailer & Details */}
              <button
                id={`hero-watch-btn-${current.id}`}
                onClick={() => {
                  setSelectedMovie(current);
                  trackGAEvent('click_hero_watch', { movie_id: current.id, movie_title: current.title });
                }}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 sm:px-4 py-1.2 sm:py-1.5 rounded-md transition-all shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95 text-[10.5px] sm:text-xs cursor-pointer border border-blue-400/40"
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                <span>Watch Trailer</span>
              </button>

              {/* Telegram Channel Button */}
              <a
                id="hero-telegram-btn"
                href={current.telegramChannelUrl || settings.telegramChannelUrl || 'https://t.me/DETFLIX_H'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGAEvent('telegram_click', { location: 'hero_banner', movie: current.title })}
                className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold px-2.5 sm:px-3.5 py-1.2 sm:py-1.5 rounded-md transition-all shadow-md shadow-sky-600/20 hover:scale-105 active:scale-95 text-[10.5px] sm:text-xs"
              >
                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                <span>Telegram</span>
              </a>

              {/* Bookmark to Watchlist */}
              <button
                id={`hero-bookmark-btn-${current.id}`}
                onClick={() => toggleMyList(current.id)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.2 sm:py-1.5 rounded-md text-[10.5px] sm:text-xs font-semibold border backdrop-blur-md transition-all active:scale-95 ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/80'
                }`}
                title={isBookmarked ? 'Remove from Watchlist' : 'Add to My Saved Watchlist'}
              >
                {isBookmarked ? <Check className="w-3 h-3 text-amber-400" /> : <Bookmark className="w-3 h-3" />}
                <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Watchlist'}</span>
              </button>

            </div>

          </div>

        </div>

        {/* Minimal Clean Dots Indicator (Bottom Right) */}
        <div className="absolute bottom-2 right-2 sm:bottom-3.5 sm:right-5 z-20 flex items-center gap-1 bg-zinc-950/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-800/80">
          {topCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-3.5 sm:w-5 bg-blue-500' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
              }`}
              title={`Card ${idx + 1}`}
            />
          ))}
        </div>

        {/* ================= PREV & NEXT ARROWS OVERLAYS ================= */}
        <button
          id="hero-prev-arrow-btn"
          onClick={handlePrev}
          aria-label="Previous Card"
          className="hidden sm:flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-zinc-950/60 hover:bg-blue-600 text-white backdrop-blur-md border border-zinc-700/60 transition-all hover:scale-110 active:scale-95"
          title="Previous Card"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          id="hero-next-arrow-btn"
          onClick={handleNext}
          aria-label="Next Card"
          className="hidden sm:flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-zinc-950/60 hover:bg-blue-600 text-white backdrop-blur-md border border-zinc-700/60 transition-all hover:scale-110 active:scale-95 group"
          title="Next Card (Auto switches every 10s)"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>

      </div>

    </section>
  );
};
