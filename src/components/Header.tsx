import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatTimeAgo } from '../utils/helpers';
import { trackGAEvent } from '../lib/analytics';
import { Search, Film, Send, Shield, Bookmark, X, Menu, Tv, Sparkles, UserCheck, Smartphone, Download, Bell, MessageSquare, CheckCheck, Eye } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    user,
    setIsDownloadModalOpen,
    setIsAdminOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isAdminOpen,
    comments,
    movies,
    setSelectedMovie
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Track last read comments timestamp
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem('detflix_last_read_comments');
    return saved ? Number(saved) : 0;
  });

  // Calculate unread items (comments created after lastReadTimestamp)
  const unreadComments = comments.filter(c => {
    const commentTime = new Date(c.createdAt).getTime();
    return commentTime > lastReadTimestamp;
  });

  const markAllAsRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    localStorage.setItem('detflix_last_read_comments', now.toString());
  };

  const categories = [
    { id: 'All', label: 'Home' },
    { id: 'movie', label: 'Movies' },
    { id: 'drama', label: 'Drama Series' },
    { id: 'web-series', label: 'Web Series' },
    { id: 'anime', label: 'Anime' },
    { id: 'my-list', label: 'Saved Items' },
  ];

  return (
    <header id="detflix-header" className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo & Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => { setSelectedCategory('All'); setIsAdminOpen(false); }}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="bg-blue-600 text-white font-black px-2.5 py-1 rounded text-xl sm:text-2xl tracking-tighter shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
              DET
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-blue-500 transition-colors">
              FLIX
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`nav-cat-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setIsAdminOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id && !isAdminOpen
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {cat.id === 'my-list' && <Bookmark className="w-3.5 h-3.5 fill-current text-amber-400" />}
                <span>{cat.label}</span>
                {cat.id === 'my-list' && user.myList.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    {user.myList.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop Search Input */}
          <div className="hidden sm:flex relative items-center">
            <div className={`flex items-center bg-zinc-900 border border-zinc-700/80 rounded-full px-3 py-1.5 transition-all duration-300 ${
              isSearchExpanded || searchQuery ? 'w-48 sm:w-64 border-blue-500/50 shadow-sm' : 'w-10 sm:w-48'
            }`}>
              <Search className="w-4 h-4 text-zinc-400 shrink-0 cursor-pointer" onClick={() => setIsSearchExpanded(true)} />
              <input
                id="search-input"
                type="text"
                placeholder="Search movies, drama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                className={`bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none ml-2 w-full ${
                  !isSearchExpanded && !searchQuery ? 'hidden sm:block' : 'block'
                }`}
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Telegram Channel Icon-Only Mini Button */}
          <a
            id="header-telegram-link"
            href={settings.telegramChannelUrl || 'https://t.me/DETFLIX_H'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGAEvent('telegram_click', { location: 'header' })}
            className="p-2 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
            title="Join Official Telegram Channel"
          >
            <Send className="w-4 h-4 fill-current ml-0.5" />
          </a>

          {/* Admin Panel Toggle */}
          <button
            id="header-admin-btn"
            onClick={() => {
              setIsAdminOpen(!isAdminOpen);
              setIsNotifOpen(false);
            }}
            className={`p-2 rounded-full border transition-all ${
              isAdminOpen
                ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/30'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="Admin Panel"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Comment Notification Mini Button & Dropdown */}
          <div className="relative">
            <button
              id="header-comments-notification-btn"
              onClick={() => {
                const nextState = !isNotifOpen;
                setIsNotifOpen(nextState);
                if (nextState) {
                  markAllAsRead();
                }
              }}
              className={`p-2 rounded-full border transition-all relative ${
                isNotifOpen
                  ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-500/30'
                  : unreadComments.length > 0
                  ? 'bg-blue-950 text-blue-400 border-blue-600 animate-pulse'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Comment Notifications & Updates"
            >
              <Bell className="w-4 h-4" />
              {unreadComments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-zinc-950 animate-bounce">
                  {unreadComments.length > 9 ? '9+' : unreadComments.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotifOpen && (
              <div
                id="comment-notifications-dropdown"
                className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 w-auto sm:w-96 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-3.5 sm:p-4 z-50 animate-fadeIn backdrop-blur-md space-y-3 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white">Comment Activity</h4>
                    <span className="bg-blue-950/80 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-800/60">
                      {comments.length} Total
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                      <span>Read All</span>
                    </button>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Comment Notifications Scroll Area */}
                <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No comments yet. When users comment, notifications will appear here!
                    </div>
                  ) : (
                    comments.slice(0, 20).map((comment) => {
                      const movie = movies.find(m => m.id === comment.movieId);
                      const isUnread = new Date(comment.createdAt).getTime() > lastReadTimestamp;
                      const isDetflix = comment.userName.toUpperCase().includes('DETFLIX');

                      return (
                        <div
                          key={comment.id}
                          onClick={() => {
                            if (movie) {
                              setSelectedMovie(movie);
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                            isUnread 
                              ? 'bg-blue-950/20 border-blue-800/50 hover:bg-blue-900/30' 
                              : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          {movie?.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded bg-zinc-800 shrink-0 shadow" />
                          ) : (
                            <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                              <Film className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-blue-400 truncate group-hover:text-blue-300">
                                {movie ? movie.title : 'Movie'}
                              </span>
                              <span className="text-[9px] text-zinc-500 shrink-0">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[11px] font-bold ${isDetflix ? 'text-amber-400' : 'text-white'}`}>
                                {comment.userName}
                              </span>
                              {isDetflix && (
                                <span className="bg-blue-950 text-blue-400 text-[8px] font-black px-1 rounded uppercase">
                                  Official
                                </span>
                              )}
                              {comment.replies && comment.replies.length > 0 && (
                                <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-800/50 px-1 rounded font-semibold ml-auto">
                                  {comment.replies.length} replies
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-zinc-300 line-clamp-2 mt-0.5 italic">
                              "{comment.text}"
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Search Bar (Below Header Top Row) */}
      <div className="sm:hidden px-4 pb-3 pt-1">
        <div className="relative flex items-center bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 w-full focus-within:border-blue-500/60 shadow-inner">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2" />
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search movies, drama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              id="clear-mobile-search-btn"
              onClick={() => setSearchQuery('')}
              className="text-zinc-400 hover:text-white p-0.5 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3 space-y-2.5">
          
          {/* Saved Items Featured Quick Button */}
          <button
            id="mobile-saved-watchlist-btn"
            onClick={() => {
              setSelectedCategory('my-list');
              setIsAdminOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedCategory === 'my-list' && !isAdminOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg'
                : 'bg-zinc-900 text-amber-400 border-amber-500/30 hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">Saved Movies & Drama</div>
                <div className="text-[10px] text-zinc-400 font-normal">View your saved watchlist</div>
              </div>
            </div>
            <span className="bg-amber-500 text-zinc-950 px-2.5 py-0.5 rounded-full text-xs font-black">
              {user.myList.length} Saved
            </span>
          </button>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`mobile-cat-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setIsAdminOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center justify-between ${
                  selectedCategory === cat.id && !isAdminOpen
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {cat.id === 'my-list' ? (
                    <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  ) : (
                    <Film className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                  <span className="truncate">{cat.label}</span>
                </div>
                {cat.id === 'my-list' && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ml-1">
                    {user.myList.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Telegram Link */}
          <div className="pt-1">
            <a
              id="mobile-telegram-link"
              href={settings.telegramChannelUrl || 'https://t.me/DETFLIX_H'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg text-xs font-bold w-full transition-colors"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              Telegram Channel
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
