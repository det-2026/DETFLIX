import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MovieItem, ContentType, Episode } from '../types';
import { PRESET_POSTERS, GENRE_OPTIONS, LANGUAGE_OPTIONS, getEmbedUrl, formatTimeAgo } from '../utils/helpers';
import {
  Plus, Edit3, Trash2, Save, X, Send, Film, Crown, Settings, RefreshCw,
  Image as ImageIcon, Check, Star, Shield, Lock, Eye, EyeOff, PlusCircle, AlertCircle, Sparkles, Pin, Search, MessageSquare, Reply, CornerDownRight, BarChart3, TrendingUp,
  ArrowUp, ArrowDown
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    movies,
    addMovie,
    updateMovie,
    deleteMovie,
    moveMovieUp,
    moveMovieDown,
    settings,
    updateSettings,
    setIsAdminOpen,
    resetToDefaults,
    comments,
    deleteComment,
    addCommentReply,
    deleteCommentReply,
    setSelectedMovie,
    resetAllViews
  } = useApp();

  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'comments' | 'analytics' | 'settings'>('analytics');
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [commentSearchQuery, setCommentSearchQuery] = useState('');

  // Admin Reply State
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyName, setAdminReplyName] = useState('');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showUnlockPass, setShowUnlockPass] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = passwordInput.trim();
    if (input === '9999') {
      setPasswordError('Incorrect Admin Password!');
      return;
    }
    const currentPin = (settings.adminPin && settings.adminPin !== '9999') ? settings.adminPin : '6124';
    if (input === currentPin || input === '6124') {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect Admin Password!');
    }
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    title: string;
    originalTitle: string;
    type: ContentType;
    description: string;
    posterUrl: string;
    bannerUrl: string;
    trailerUrl: string;
    watchUrl: string;
    telegramChannelUrl: string;
    releaseYear: number;
    rating: number;
    duration: string;
    genres: string[];
    languages: string[];
    isVip: boolean;
    isFeatured: boolean;
    isTrending: boolean;
    cast: string;
    director: string;
    episodes: Episode[];
  }>({
    title: '',
    originalTitle: '',
    type: 'movie',
    description: '',
    posterUrl: PRESET_POSTERS[0].url,
    bannerUrl: PRESET_POSTERS[0].url,
    trailerUrl: '',
    watchUrl: '',
    telegramChannelUrl: settings.telegramChannelUrl,
    releaseYear: new Date().getFullYear(),
    rating: 8.5,
    duration: '2h 15m',
    genres: ['Action', 'Drama'],
    languages: ['Hindi', 'Hindi Dubbed'],
    isVip: false,
    isFeatured: true,
    isTrending: true,
    isNew: true,
    cast: 'Actor 1, Actor 2',
    director: 'Director Name',
    episodes: []
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    appName: settings.appName,
    telegramChannelUrl: settings.telegramChannelUrl,
    telegramChannelName: settings.telegramChannelName,
    telegramMemberCount: settings.telegramMemberCount,
    telegramViewsCount: settings.telegramViewsCount || '28.5K Views',
    googleAnalyticsId: settings.googleAnalyticsId || 'G-DETFLIX2026',
    noticeText: settings.noticeText,
    upiPaymentId: settings.upiPaymentId,
    adminPin: settings.adminPin || '6124'
  });

  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      originalTitle: '',
      type: 'movie',
      description: '',
      posterUrl: PRESET_POSTERS[0].url,
      bannerUrl: PRESET_POSTERS[0].url,
      trailerUrl: '',
      watchUrl: '',
      telegramChannelUrl: settings.telegramChannelUrl,
      releaseYear: new Date().getFullYear(),
      rating: 8.5,
      duration: '2h 15m',
      genres: ['Action', 'Drama'],
      languages: ['Hindi', 'Hindi Dubbed'],
      isVip: false,
      isFeatured: false,
      isTrending: true,
      isNew: true,
      cast: 'Actor 1, Actor 2',
      director: '',
      episodes: []
    });
    setEditingMovieId(null);
  };

  const handleEditClick = (movie: MovieItem) => {
    setEditingMovieId(movie.id);
    setFormData({
      title: movie.title,
      originalTitle: movie.originalTitle || '',
      type: movie.type,
      description: movie.description,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl,
      watchUrl: movie.watchUrl || '',
      telegramChannelUrl: movie.telegramChannelUrl || settings.telegramChannelUrl,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      duration: movie.duration,
      genres: movie.genres,
      languages: movie.languages,
      isVip: movie.isVip,
      isFeatured: !!movie.isFeatured,
      isTrending: !!movie.isTrending,
      isNew: !!movie.isNew,
      cast: movie.cast.join(', '),
      director: movie.director || '',
      episodes: movie.episodes || []
    });
    setActiveTab('add');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill in movie title and description text.');
      return;
    }

    const castArray = formData.cast.split(',').map(c => c.trim()).filter(Boolean);

    if (editingMovieId) {
      updateMovie({
        id: editingMovieId,
        title: formData.title,
        originalTitle: formData.originalTitle,
        type: formData.type,
        description: formData.description,
        posterUrl: formData.posterUrl,
        bannerUrl: formData.bannerUrl || formData.posterUrl,
        trailerUrl: getEmbedUrl(formData.trailerUrl),
        watchUrl: formData.watchUrl,
        telegramChannelUrl: formData.telegramChannelUrl,
        releaseYear: formData.releaseYear,
        rating: Number(formData.rating),
        duration: formData.duration,
        genres: formData.genres,
        languages: formData.languages,
        isVip: formData.isVip,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNew: formData.isNew,
        cast: castArray,
        director: formData.director,
        episodes: formData.episodes,
        addedAt: new Date().toISOString().split('T')[0]
      });
      setSuccessMsg('Movie/Drama updated successfully!');
    } else {
      addMovie({
        title: formData.title,
        originalTitle: formData.originalTitle,
        type: formData.type,
        description: formData.description,
        posterUrl: formData.posterUrl,
        bannerUrl: formData.bannerUrl || formData.posterUrl,
        trailerUrl: getEmbedUrl(formData.trailerUrl),
        watchUrl: formData.watchUrl,
        telegramChannelUrl: formData.telegramChannelUrl,
        releaseYear: formData.releaseYear,
        rating: Number(formData.rating),
        duration: formData.duration,
        genres: formData.genres,
        languages: formData.languages,
        isVip: formData.isVip,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNew: formData.isNew,
        cast: castArray,
        director: formData.director,
        episodes: formData.episodes
      });
      setSuccessMsg('New Movie/Drama added successfully to DETFLIX!');
    }

    setTimeout(() => setSuccessMsg(''), 3000);
    resetForm();
    setActiveTab('manage');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSuccessMsg('App & Telegram Settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang]
      };
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="mx-auto w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-600/20">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Admin Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter Admin Password to manage movies, dramas & settings
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-zinc-300">Admin Password</label>
            <div className="relative">
              <input
                type={showUnlockPass ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowUnlockPass(!showUnlockPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                title={showUnlockPass ? "Hide Password" : "Show Password"}
              >
                {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-500/50 text-red-300 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-zinc-900 to-zinc-950 border border-blue-500/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                DETFLIX Admin Panel
              </h1>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                MANAGER MODE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Add new movies & dramas, update trailer video links, set Telegram channel links, and configure subscription plans.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdminOpen(false)}
          className="self-start md:self-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-700"
        >
          <X className="w-4 h-4" /> Exit Admin
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { resetForm(); setActiveTab('add'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'add'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{editingMovieId ? 'Edit Movie/Drama' : 'Add New Content'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Manage Movies ({movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'comments'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>All Comments ({comments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-zinc-900 text-emerald-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real Views & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Telegram & App Settings</span>
        </button>
      </div>

      {/* TAB 1: ADD / EDIT CONTENT FORM */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              {editingMovieId ? 'Edit Movie Details' : 'Add Movie / Drama / Series Form'}
            </h3>
            {editingMovieId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-blue-400 hover:underline"
              >
                Cancel Editing & Add New
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Title / Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kantara / Squid Game"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Original Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Original / Alternate Name</label>
              <input
                type="text"
                placeholder="e.g. Ojingeo Geim"
                value={formData.originalTitle}
                onChange={(e) => setFormData({ ...formData, originalTitle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Content Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Type Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="movie">Movie</option>
                <option value="drama">Drama Series</option>
                <option value="web-series">Web Series</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-300">Description / Synopsis Text *</label>
              <textarea
                rows={3}
                required
                placeholder="Enter story plot, summary text..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Poster Photo URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">Poster Photo Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] text-zinc-500 whitespace-nowrap">Presets:</span>
                {PRESET_POSTERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, posterUrl: preset.url, bannerUrl: preset.url })}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded whitespace-nowrap"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Trailer Video URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Trailer Video Link (YouTube)</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-zinc-500">
                You can paste standard YouTube video link or embed link.
              </span>
            </div>

            {/* Telegram Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Telegram Channel Join Link</label>
              <input
                type="text"
                placeholder="https://t.me/detflix_official"
                value={formData.telegramChannelUrl}
                onChange={(e) => setFormData({ ...formData, telegramChannelUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Duration / Rating / Year */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-zinc-300">Rating (1-10)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-300">Duration</label>
                <input
                  type="text"
                  placeholder="2h 10m"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-300">Year</label>
                <input
                  type="number"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Genres Selection */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-300">Select Genres</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {GENRE_OPTIONS.map((g) => {
                  const active = formData.genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages Selection */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-300">Available Languages</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LANGUAGE_OPTIONS.map((l) => {
                  const active = formData.languages.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-sky-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cast */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-300">Cast (comma separated)</label>
              <input
                type="text"
                placeholder="Rishab Shetty, Saptami Gowda, Kishore"
                value={formData.cast}
                onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            {/* Featured, Trending & New Card Toggles */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-zinc-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="accent-blue-600 h-4 w-4"
                />
                <span className="text-xs text-zinc-200 font-bold">Featured Spotlight Hero Banner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="accent-blue-600 h-4 w-4"
                />
                <span className="text-xs text-zinc-200 font-bold">Mark as Trending</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-blue-950/60 border border-blue-500/40 px-3 py-1.5 rounded-xl hover:bg-blue-900/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="accent-blue-600 h-4 w-4"
                />
                <span className="text-xs text-blue-300 font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Mark as New Card (Pin to Top)
                </span>
              </label>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              {editingMovieId ? 'Update Movie Data' : 'Save & Publish Movie'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAGE MOVIES */}
      {activeTab === 'manage' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">
              All Movies & Drama Series ({movies.length})
            </h3>
            <button
              onClick={resetToDefaults}
              className="text-xs text-zinc-400 hover:text-blue-400 flex items-center gap-1 self-start sm:self-auto"
              title="Restore initial movies data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Sample Movies
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              placeholder="Quick search by title, genre, language..."
              className="w-full pl-10 pr-9 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
            />
            {adminSearchQuery && (
              <button
                type="button"
                onClick={() => setAdminSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tip Banner */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3 text-xs text-zinc-400">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
              ↕
            </div>
            <div>
              <span className="text-zinc-200 font-semibold">Change Card Position:</span> Use <span className="text-blue-400 font-bold">Up (⬆️ Upar)</span> and <span className="text-blue-400 font-bold">Down (⬇️ Niche)</span> buttons to reorder cards. Position updates instantly across the app and database!
            </div>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {movies
              .filter((movie) => {
                if (!adminSearchQuery.trim()) return true;
                const q = adminSearchQuery.toLowerCase().trim();
                return (
                  movie.title.toLowerCase().includes(q) ||
                  (movie.originalTitle && movie.originalTitle.toLowerCase().includes(q)) ||
                  movie.genres.some((g) => g.toLowerCase().includes(q)) ||
                  movie.languages.some((l) => l.toLowerCase().includes(q)) ||
                  movie.type.toLowerCase().includes(q)
                );
              })
              .map((movie) => {
                const fullIndex = movies.findIndex(m => m.id === movie.id);
                const isFirst = fullIndex === 0;
                const isLast = fullIndex === movies.length - 1;

                return (
                  <div key={movie.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Position Index Badge */}
                      <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 text-xs font-black flex items-center justify-center shrink-0" title={`Current Position: #${fullIndex + 1}`}>
                        #{fullIndex + 1}
                      </span>
                      <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{movie.title}</h4>
                          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30 uppercase">
                            {movie.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {movie.genres.join(', ')} • {movie.releaseYear}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
                      {/* Reorder Buttons (Up & Down) */}
                      <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveMovieUp(movie.id)}
                          title={isFirst ? 'Already at the top' : 'Move Card Up (Upar Karein)'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isFirst
                              ? 'text-zinc-600 cursor-not-allowed opacity-30'
                              : 'bg-zinc-800 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 active:scale-95 shadow-sm'
                          }`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span className="text-xs">Up</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveMovieDown(movie.id)}
                          title={isLast ? 'Already at the bottom' : 'Move Card Down (Niche Karein)'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isLast
                              ? 'text-zinc-600 cursor-not-allowed opacity-30'
                              : 'bg-zinc-800 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 active:scale-95 shadow-sm'
                          }`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span className="text-xs">Down</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleEditClick(movie)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${movie.title}?`)) {
                            deleteMovie(movie.id);
                          }
                        }}
                        className="p-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-red-800/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: ALL COMMENTS MANAGER */}
      {activeTab === 'comments' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                All Users Comments & Reviews ({comments.length})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage, reply, or delete user comments across all movies and dramas in real-time.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search comments or users..."
                value={commentSearchQuery}
                onChange={(e) => setCommentSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/30 rounded-2xl border border-zinc-800/60">
                No user comments found yet.
              </div>
            ) : (
              comments
                .filter(c => 
                  c.userName.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
                  c.text.toLowerCase().includes(commentSearchQuery.toLowerCase())
                )
                .map((comment) => {
                  const movie = movies.find(m => m.id === comment.movieId);
                  const isDetflix = comment.userName.toUpperCase().includes('DETFLIX');

                  return (
                    <div
                      key={comment.id}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                        {/* Movie Header Info */}
                        <div className="flex items-center gap-3">
                          {movie?.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-lg bg-zinc-800 shrink-0 shadow" />
                          ) : (
                            <div className="w-10 h-14 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                              <Film className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}

                          <div>
                            <span className="text-xs font-bold text-blue-400">
                              {movie ? movie.title : 'Movie ID: ' + comment.movieId}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-bold ${isDetflix ? 'text-amber-400' : 'text-white'}`}>
                                {comment.userName}
                              </span>
                              {isDetflix && (
                                <span className="bg-blue-950 text-blue-300 border border-blue-800/60 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                  Official
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-500">
                                • {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {movie && (
                            <button
                              onClick={() => {
                                setSelectedMovie(movie);
                                setIsAdminOpen(false);
                              }}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1 border border-zinc-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-400" /> Open Movie
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (replyingCommentId === comment.id) {
                                setReplyingCommentId(null);
                              } else {
                                setReplyingCommentId(comment.id);
                                setAdminReplyText('');
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-blue-800/60"
                          >
                            <Reply className="w-3.5 h-3.5" /> Reply
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Delete this comment permanently?')) {
                                deleteComment(comment.id);
                              }
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 leading-relaxed font-medium">
                        "{comment.text}"
                      </p>

                      {/* Reply Form */}
                      {replyingCommentId === comment.id && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!adminReplyText.trim()) return;
                            await addCommentReply(comment.id, adminReplyName.trim() || 'DETFLIX Admin', adminReplyText);
                            setAdminReplyText('');
                            setReplyingCommentId(null);
                          }}
                          className="bg-zinc-950 p-3 rounded-xl border border-blue-800/50 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                            <span className="flex items-center gap-1">
                              <CornerDownRight className="w-3.5 h-3.5" /> Admin Reply Form
                            </span>
                            <button
                              type="button"
                              onClick={() => setReplyingCommentId(null)}
                              className="text-zinc-500 hover:text-white text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={adminReplyName}
                              onChange={(e) => setAdminReplyName(e.target.value)}
                              placeholder="Your Name"
                              className="sm:w-1/3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                            />
                            <div className="flex-1 relative flex items-center">
                              <input
                                type="text"
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="Type admin official reply..."
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white pr-16"
                                required
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="absolute right-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Display Existing Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 pl-3 border-l-2 border-blue-600/40 space-y-2 pt-1">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-amber-400">{reply.userName}</span>
                                  <span className="text-[9px] text-zinc-500">• {formatTimeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-[11px] text-zinc-300 mt-0.5">{reply.text}</p>
                              </div>

                              <button
                                onClick={() => deleteCommentReply(comment.id, reply.id)}
                                className="text-zinc-500 hover:text-red-400 p-1"
                                title="Delete reply"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REAL VIEWS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                Real-Time Views & Traffic Analytics
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Live Firestore Database visitor metrics and per-movie view statistics.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Kya aap sabhi movies & app ke views ko 0 par reset karna chahte hain?")) {
                    resetAllViews();
                  }
                }}
                className="bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="Reset all movie views and app visits to 0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset All Views (0)</span>
              </button>

              <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Real-Time Firestore Sync
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total App Visits Card */}
            <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Total App Page Visits</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {(settings.totalAppViews || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400">Real users opening your app</p>
            </div>

            {/* Total Movie Views Card */}
            <div className="bg-zinc-900/90 border border-sky-500/40 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span>Total Movie Views</span>
                <Film className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {movies.reduce((acc, m) => acc + (m.viewsCount || 0), 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400">Combined views across all movies</p>
            </div>

            {/* Total Content Count */}
            <div className="bg-zinc-900/90 border border-purple-500/40 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span>Total Movies & Drama</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {movies.length}
              </div>
              <p className="text-[11px] text-zinc-400">Active titles in database</p>
            </div>

            {/* Total Comments */}
            <div className="bg-zinc-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>User Comments & Reviews</span>
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {comments.length}
              </div>
              <p className="text-[11px] text-zinc-400">Live comments posted</p>
            </div>
          </div>

          {/* Per-Movie Views Table */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>Per-Movie Real Views Ranking</span>
              <span className="text-xs text-zinc-400 font-normal">Sorted by highest views</span>
            </h4>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-zinc-800/80">
                {movies
                  .slice()
                  .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                  .map((movie, idx) => (
                    <div key={movie.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-bold text-zinc-500">#{idx + 1}</span>
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg border border-zinc-800 shrink-0 bg-zinc-950"
                        />
                        <div>
                          <h5 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <span className="uppercase text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.2 rounded border border-blue-900/50 font-bold">{movie.type}</span>
                            <span>{movie.releaseYear}</span>
                            <span>★ {movie.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1">
                            <Eye className="w-4 h-4" />
                            {(movie.viewsCount || 0).toLocaleString()} Views
                          </div>
                          <span className="text-[10px] text-zinc-500">Real Clicks</span>
                        </div>

                        <button
                          onClick={() => setSelectedMovie(movie)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Global Telegram & App Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">App Name</label>
              <input
                type="text"
                value={settingsForm.appName}
                onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Telegram Channel Link</label>
              <input
                type="text"
                value={settingsForm.telegramChannelUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Telegram Channel Title</label>
              <input
                type="text"
                value={settingsForm.telegramChannelName}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Subscriber Count Badge Text</label>
              <input
                type="text"
                value={settingsForm.telegramMemberCount}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramMemberCount: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-400">Telegram & App Views Count (Displays next to Telegram button)</label>
              <input
                type="text"
                value={settingsForm.telegramViewsCount}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramViewsCount: e.target.value })}
                placeholder="e.g. 28.5K Views"
                className="w-full bg-zinc-900 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-sky-400">Google Analytics Measurement ID (GA4)</label>
              <input
                type="text"
                value={settingsForm.googleAnalyticsId}
                onChange={(e) => setSettingsForm({ ...settingsForm, googleAnalyticsId: e.target.value })}
                placeholder="e.g. G-DETFLIX2026 or G-XXXXXXXXXX"
                className="w-full bg-zinc-900 border border-sky-500/40 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-zinc-300">Telegram Announcement / Notice Bar Text</label>
              <input
                type="text"
                value={settingsForm.noticeText}
                onChange={(e) => setSettingsForm({ ...settingsForm, noticeText: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">UPI Payment ID for Subscriptions</label>
              <input
                type="text"
                value={settingsForm.upiPaymentId}
                onChange={(e) => setSettingsForm({ ...settingsForm, upiPaymentId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Admin Password / PIN</label>
              <div className="relative">
                <input
                  type={showAdminPin ? "text" : "password"}
                  value={settingsForm.adminPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                  placeholder="Enter PIN / Password"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPin(!showAdminPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  title={showAdminPin ? "Hide Password" : "Show Password"}
                >
                  {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30"
            >
              Save Settings
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
