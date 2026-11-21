import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getEmbedUrl, formatTimeAgo } from '../utils/helpers';
import { trackGAEvent } from '../lib/analytics';
import {
  X, Play, Send, Star, Bookmark, Check, Share2,
  Copy, MessageSquare, Trash2, CornerDownRight, Reply, Eye, ArrowLeft
} from 'lucide-react';

export const MovieDetailModal: React.FC = () => {
  const {
    selectedMovie,
    setSelectedMovie,
    settings,
    user,
    toggleMyList,
    comments,
    addComment,
    deleteComment,
    addCommentReply,
    deleteCommentReply
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [commentName, setCommentName] = useState(user.name || '');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState(user.name || '');
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Lock background scroll & support Escape key when card is open in full screen
  useEffect(() => {
    if (!selectedMovie) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMovie(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMovie, setSelectedMovie]);

  if (!selectedMovie) return null;

  const isBookmarked = user.myList.includes(selectedMovie.id);
  const telegramUrl = selectedMovie.telegramChannelUrl || settings.telegramChannelUrl || 'https://t.me/DETFLIX_H';
  const trailerRaw = selectedMovie.trailerUrl || selectedMovie.watchUrl || 'https://www.youtube.com/embed/8r_6o2aBff4';
  const embedTrailer = getEmbedUrl(trailerRaw);

  const movieComments = comments.filter(c => c.movieId === selectedMovie.id);

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(telegramUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await addComment(selectedMovie.id, commentName.trim() || 'User', commentText);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handlePostReply = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    await addCommentReply(commentId, replyName.trim() || 'User', replyText);
    setReplyText('');
    setReplyingCommentId(null);
    setIsSubmittingReply(false);
  };

  const handleQuickTag = (tag: string) => {
    setCommentText(prev => prev ? `${prev} ${tag}` : tag);
  };

  return (
    <div
      id="movie-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-zinc-950 flex flex-col w-full h-[100dvh] overflow-hidden animate-fadeIn"
    >
      <div
        id="movie-detail-modal-card"
        className="relative w-full h-full bg-zinc-950 flex flex-col overflow-hidden"
      >
        
        {/* Full-Screen Top Navigation Bar with Back & Close Buttons */}
        <div className="shrink-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-6 py-2.5 sm:py-3 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
          <button
            id="back-modal-btn"
            onClick={() => setSelectedMovie(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs sm:text-sm font-bold border border-zinc-800 transition-all active:scale-95 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>Back</span>
          </button>

          <h3 className="flex-1 text-xs sm:text-sm font-bold text-zinc-200 truncate text-center">
            {selectedMovie.title}
          </h3>

          <button
            id="close-modal-btn"
            onClick={() => setSelectedMovie(null)}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-300 hover:text-white transition-colors border border-zinc-800 cursor-pointer"
            title="Close Full Screen"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          
          {/* Top Video Trailer / Banner Header */}
          <div className="w-full bg-black border-b border-zinc-900">
            <div className="relative w-full max-w-6xl mx-auto aspect-video sm:aspect-[21/9] bg-black">
              {embedTrailer ? (
                <iframe
                  id="trailer-iframe"
                  src={embedTrailer}
                  title={selectedMovie.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedMovie.bannerUrl || selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Card Main Body */}
          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* Title & Key Badges */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase">
                    {selectedMovie.type}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedMovie.rating}
                  </span>
                  <span className="text-zinc-400 text-xs font-medium">{selectedMovie.releaseYear}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-zinc-900 border border-emerald-900/50 px-2 py-0.5 rounded text-xs" title="Real Movie Views">
                    <Eye className="w-3.5 h-3.5" /> {(selectedMovie.viewsCount || 1).toLocaleString()} Views
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {selectedMovie.title}
                </h2>

                {selectedMovie.originalTitle && (
                  <p className="text-xs sm:text-sm text-zinc-400 italic">
                    Original Name: {selectedMovie.originalTitle}
                  </p>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="modal-bookmark-btn"
                  onClick={() => toggleMyList(selectedMovie.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isBookmarked
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                >
                  {isBookmarked ? <Check className="w-4 h-4 text-blue-500" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isBookmarked ? 'Saved' : 'Watchlist'}</span>
                </button>

                <button
                  id="modal-share-btn"
                  onClick={handleCopyTelegram}
                  className="flex items-center gap-1.5 bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  title="Copy Channel Link"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

            </div>

            {/* Telegram Channel Highlight Card */}
            <div id="telegram-channel-card" className="bg-gradient-to-r from-sky-950/60 via-zinc-900 to-sky-900/40 border border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-sky-950/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-md">
                  <Send className="w-6 h-6 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {settings.telegramChannelName}
                    </h4>
                    {settings.telegramMemberCount && (
                      <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-sky-500/30">
                        {settings.telegramMemberCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sky-200/80 mt-0.5 line-clamp-1">
                    {settings.noticeText}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  id="modal-telegram-join-btn"
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGAEvent('telegram_click', { location: 'movie_modal', movie: selectedMovie.title })}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-sky-500/20 active:scale-95"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>JOIN TELEGRAM CHANNEL</span>
                </a>

                <button
                  onClick={handleCopyTelegram}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 rounded-xl"
                  title="Copy Telegram Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Synopsis & Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                Synopsis & Details
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                {selectedMovie.description}
              </p>
            </div>

            {/* Movie Meta Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block">Duration</span>
                <span className="font-semibold text-white">{selectedMovie.duration}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Languages</span>
                <span className="font-semibold text-white">{selectedMovie.languages.join(', ')}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Genres</span>
                <span className="font-semibold text-white">{selectedMovie.genres.join(', ')}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Cast</span>
                <span className="font-semibold text-white line-clamp-1">{selectedMovie.cast.join(', ')}</span>
              </div>
            </div>

            {/* Comments & Discussion Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>Comments & Reviews ({movieComments.length})</span>
                </h3>
                <span className="text-xs text-zinc-400">Share your feedback</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostComment} className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-1/3 flex flex-col gap-1">
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div className="flex-1 relative flex items-start">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment or movie review..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 pr-20"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !commentText.trim()}
                      className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Emoji Reaction Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase mr-1">Quick Tags:</span>
                  {['🔥 Superb Movie!', '❤️ Loved it!', '⭐ 10/10 Print', '👍 HD Quality', '🚀 Fast Download'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className="text-[11px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Comments & Replies List */}
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {movieComments.length === 0 ? (
                  <div className="text-center py-6 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-zinc-500 text-xs">
                    No comments yet. Be the first to leave a comment!
                  </div>
                ) : (
                  movieComments.map((comment) => {
                    const isDetflixUser = comment.userName.toUpperCase().includes('DETFLIX');
                    return (
                      <div
                        key={comment.id}
                        className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl space-y-2 group hover:border-zinc-700/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow ${
                              isDetflixUser 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 ring-1 ring-blue-400/50' 
                                : 'bg-zinc-800 text-zinc-300'
                            }`}>
                              {comment.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold ${isDetflixUser ? 'text-blue-400' : 'text-white'}`}>
                                  {comment.userName}
                                </span>
                                {isDetflixUser && (
                                  <span className="bg-blue-950 text-blue-300 border border-blue-800/60 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                    Official
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-500">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (replyingCommentId === comment.id) {
                                  setReplyingCommentId(null);
                                } else {
                                  setReplyingCommentId(comment.id);
                                  setReplyText('');
                                }
                              }}
                              className="text-xs text-zinc-400 hover:text-blue-400 flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800/80 transition-colors"
                              title="Reply to comment"
                            >
                              <Reply className="w-3 h-3 text-blue-500" />
                              <span className="text-[11px] font-semibold">Reply</span>
                            </button>

                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Reply Form */}
                        {replyingCommentId === comment.id && (
                          <form
                            onSubmit={(e) => handlePostReply(comment.id, e)}
                            className="ml-8 mt-2 p-3 bg-zinc-950 border border-blue-900/40 rounded-xl space-y-2 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
                              <span className="flex items-center gap-1">
                                <CornerDownRight className="w-3.5 h-3.5" />
                                Replying to {comment.userName}
                              </span>
                              <button
                                type="button"
                                onClick={() => setReplyingCommentId(null)}
                                className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={replyName}
                                onChange={(e) => setReplyName(e.target.value)}
                                placeholder="Your Name"
                                className="sm:w-1/3 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                required
                              />
                              <div className="flex-1 relative flex items-center">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type your reply message..."
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 pr-16"
                                  required
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingReply || !replyText.trim()}
                                  className="absolute right-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
                                >
                                  {isSubmittingReply ? '...' : 'Send'}
                                </button>
                              </div>
                            </div>
                          </form>
                        )}

                        {/* Existing Replies List */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-7 pl-3 border-l-2 border-blue-600/40 space-y-2 mt-2 pt-1">
                            {comment.replies.map((reply) => {
                              const isReplyDetflix = reply.userName.toUpperCase().includes('DETFLIX');
                              return (
                                <div
                                  key={reply.id}
                                  className="bg-zinc-950/70 border border-zinc-800/60 p-2.5 rounded-lg flex items-start justify-between gap-2 group/reply"
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                      isReplyDetflix ? 'bg-blue-600' : 'bg-zinc-800'
                                    }`}>
                                      {reply.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[11px] font-bold ${isReplyDetflix ? 'text-blue-400' : 'text-zinc-200'}`}>
                                          {reply.userName}
                                        </span>
                                        {isReplyDetflix && (
                                          <span className="bg-blue-950 text-blue-300 text-[8px] font-bold px-1 rounded">
                                            Admin
                                          </span>
                                        )}
                                        <span className="text-[9px] text-zinc-500">
                                          {formatTimeAgo(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                                        {reply.text}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => deleteCommentReply(comment.id, reply.id)}
                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover/reply:opacity-100 transition-opacity p-0.5"
                                    title="Delete reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 p-3 sm:p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            <div className="hidden sm:block text-xs text-zinc-400">
              Added on {selectedMovie.addedAt} • DETFLIX Streaming
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                id="watch-now-external-link"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch & Download on Telegram</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
