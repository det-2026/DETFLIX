import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MovieItem, AppSettings, SubscriptionPlan, UserProfile, PlanType, CommentItem } from '../types';
import { INITIAL_MOVIES, DEFAULT_SETTINGS, DEFAULT_PLANS } from '../data/initialData';
import { initGoogleAnalytics, trackGAEvent } from '../lib/analytics';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';

interface AppContextType {
  movies: MovieItem[];
  comments: CommentItem[];
  settings: AppSettings;
  plans: SubscriptionPlan[];
  user: UserProfile;
  selectedMovie: MovieItem | null;
  setSelectedMovie: (movie: MovieItem | null) => void;
  isSubscriptionOpen: boolean;
  setIsSubscriptionOpen: (open: boolean) => void;
  isDownloadModalOpen: boolean;
  setIsDownloadModalOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  
  // Actions
  addMovie: (movie: Omit<MovieItem, 'id' | 'addedAt'>) => void;
  updateMovie: (movie: MovieItem) => void;
  deleteMovie: (id: string) => void;
  addComment: (movieId: string, userName: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  addCommentReply: (commentId: string, userName: string, text: string) => Promise<void>;
  deleteCommentReply: (commentId: string, replyId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setUserPlan: (plan: PlanType) => void;
  toggleMyList: (movieId: string) => void;
  incrementMovieView: (movieId: string) => Promise<void>;
  moveMovieUp: (movieId: string) => Promise<void>;
  moveMovieDown: (movieId: string) => Promise<void>;
  resetAllViews: () => Promise<void>;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  USER: 'detflix_user_v1',
  COMMENTS: 'detflix_comments_v2',
};

// Helper to remove undefined fields before writing to Firestore
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (saved) {
      try {
        const parsed: CommentItem[] = JSON.parse(saved);
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        return parsed.filter(c => {
          const created = new Date(c.createdAt).getTime();
          return !isNaN(created) && (now - created) < thirtyDaysMs;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);

  // User profile stays local to device
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'DETFLIX Viewer' || parsed.name === 'User') {
          parsed.name = '';
        }
        return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      name: '',
      email: 'user@detflix.tv',
      plan: 'free',
      myList: ['det-1', 'det-2']
    };
  });

  // UI state
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const selectedMovieRef = useRef<MovieItem | null>(null);
  const hasMovieHistoryRef = useRef<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Keep ref in sync for popstate handler
  useEffect(() => {
    selectedMovieRef.current = selectedMovie;
  }, [selectedMovie]);

  // Handle mobile / browser hardware Back button to close open movie card
  useEffect(() => {
    const handlePopState = () => {
      if (hasMovieHistoryRef.current || selectedMovieRef.current) {
        hasMovieHistoryRef.current = false;
        selectedMovieRef.current = null;
        setSelectedMovie(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Google Analytics and track Real App Visit Views (Unique per device)
  useEffect(() => {
    initGoogleAnalytics();

    // Increment real total app views counter in Firestore once per device (using localStorage)
    const hasVisited = localStorage.getItem('detflix_app_visited_device_v1');
    if (!hasVisited) {
      localStorage.setItem('detflix_app_visited_device_v1', 'true');
      const settingsDocRef = doc(db, 'appSettings', 'main');
      updateDoc(settingsDocRef, {
        totalAppViews: increment(1)
      }).catch(() => {
        getDoc(settingsDocRef).then(snap => {
          const currentTotal = (snap.data()?.totalAppViews || 0) + 1;
          setDoc(settingsDocRef, { totalAppViews: currentTotal }, { merge: true }).catch(console.error);
        }).catch(console.error);
      });
    }
  }, []);

  // Real-time Movie View Incrementor (Strictly 1 View per device / mobile)
  const incrementMovieView = async (movieId: string) => {
    if (!movieId) return;

    const viewedKey = `detflix_viewed_movie_${movieId}`;
    let alreadyViewed = false;
    try {
      if (localStorage.getItem(viewedKey)) {
        alreadyViewed = true;
      }
    } catch (e) {
      console.warn("localStorage check error:", e);
    }

    // If device already recorded a view for this movie, DO NOT increment again
    if (alreadyViewed) {
      return;
    }

    // Mark as viewed on this mobile/device
    try {
      localStorage.setItem(viewedKey, 'true');
    } catch (e) {
      console.warn("localStorage set error:", e);
    }

    // Optimistically increment local state once for instant feedback
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, viewsCount: (m.viewsCount || 0) + 1 } : m));

    try {
      const movieRef = doc(db, 'movies', movieId);
      await updateDoc(movieRef, {
        viewsCount: increment(1)
      });
    } catch (err) {
      try {
        const movieRef = doc(db, 'movies', movieId);
        const snap = await getDoc(movieRef);
        if (snap.exists()) {
          const currentViews = (snap.data().viewsCount || 0) + 1;
          await setDoc(movieRef, { viewsCount: currentViews }, { merge: true });
        }
      } catch (e) {
        console.error("Error incrementing movie view:", e);
      }
    }
  };

  // Function to reset all movie views to 0 in Firestore
  const resetAllViews = async () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('detflix_viewed_movie_') || key.startsWith('detflix_app_visited_')) {
          localStorage.removeItem(key);
        }
      });
      const settingsDocRef = doc(db, 'appSettings', 'main');
      await setDoc(settingsDocRef, { totalAppViews: 0 }, { merge: true });

      const moviesSnap = await getDocs(collection(db, 'movies'));
      const promises = moviesSnap.docs.map(movieDoc => 
        updateDoc(doc(db, 'movies', movieDoc.id), { viewsCount: 0 })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error("Error resetting views:", err);
    }
  };

  const handleSetSelectedMovie = (movie: MovieItem | null) => {
    if (movie) {
      if (!hasMovieHistoryRef.current) {
        try {
          window.history.pushState({ detflixCardOpen: true, movieId: movie.id }, '');
          hasMovieHistoryRef.current = true;
        } catch (err) {
          console.warn('Failed to push history state:', err);
        }
      }
      selectedMovieRef.current = movie;
      setSelectedMovie(movie);
      if (movie.id) {
        incrementMovieView(movie.id);
        trackGAEvent('view_item', { item_id: movie.id, item_name: movie.title });
      }
    } else {
      selectedMovieRef.current = null;
      setSelectedMovie(null);
      if (hasMovieHistoryRef.current) {
        hasMovieHistoryRef.current = false;
        try {
          window.history.back();
        } catch (err) {
          console.warn('Failed to go back in history:', err);
        }
      }
    }
  };

  // Save User profile locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  // Save Comments locally for refresh persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  // Firestore Real-Time Sync: Movies
  useEffect(() => {
    const moviesRef = collection(db, 'movies');
    const demoIdsToDelete = ['det-1', 'det-2', 'det-3', 'det-4', 'det-5', 'det-6'];

    const unsubscribe = onSnapshot(moviesRef, (snapshot) => {
      const docs: MovieItem[] = [];
      snapshot.forEach(docSnap => {
        const docId = docSnap.id;
        // Remove 6 initial demo cards from Firestore if present
        if (demoIdsToDelete.includes(docId)) {
          deleteDoc(doc(db, 'movies', docId)).catch(console.error);
          return;
        }
        docs.push(docSnap.data() as MovieItem);
      });

      // Sort: isNew cards ALWAYS come first at the very top
      // Then if custom order is defined on items, sort by order ascending (0, 1, 2, 3...)
      // Otherwise fallback to releaseYear descending, then creation time
      docs.sort((a, b) => {
        const aNew = a.isNew ? 1 : 0;
        const bNew = b.isNew ? 1 : 0;
        if (aNew !== bNew) {
          return bNew - aNew; // isNew true always comes first at the top
        }

        const hasOrderA = typeof a.order === 'number';
        const hasOrderB = typeof b.order === 'number';
        if (hasOrderA && hasOrderB) {
          if (a.order !== b.order) {
            return (a.order as number) - (b.order as number);
          }
        } else if (hasOrderA) {
          return -1;
        } else if (hasOrderB) {
          return 1;
        }

        const yearA = Number(a.releaseYear) || 0;
        const yearB = Number(b.releaseYear) || 0;
        if (yearA !== yearB) {
          return yearB - yearA; // Newest release year first
        }
        const timeA = a.createdAt || a.id;
        const timeB = b.createdAt || b.id;
        return timeB.localeCompare(timeA);
      });

      docs.forEach((m) => {
        if (m.viewsCount === undefined) {
          m.viewsCount = 0;
          updateDoc(doc(db, 'movies', m.id), { viewsCount: 0 }).catch(() => {});
        }
      });

      setMovies(docs);
    }, (error) => {
      console.error("Firestore movies listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Sync: App Settings
  useEffect(() => {
    const settingsDocRef = doc(db, 'appSettings', 'main');

    getDoc(settingsDocRef).then(docSnap => {
      if (!docSnap.exists()) {
        setDoc(settingsDocRef, cleanUndefined(DEFAULT_SETTINGS)).catch(console.error);
      }
    }).catch(console.error);

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        if (data.adminPin === '9999') {
          data.adminPin = '6124';
          setDoc(settingsDocRef, { adminPin: '6124' }, { merge: true }).catch(console.error);
        }
        const mergedSettings = { ...DEFAULT_SETTINGS, ...data };
        setSettings(mergedSettings);
        initGoogleAnalytics(mergedSettings.googleAnalyticsId);
      }
    }, (error) => {
      console.error("Firestore settings listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Sync: Plans
  useEffect(() => {
    const plansRef = collection(db, 'plans');

    const unsubscribe = onSnapshot(plansRef, (snapshot) => {
      const docs: SubscriptionPlan[] = [];
      snapshot.forEach(docSnap => {
        docs.push(docSnap.data() as SubscriptionPlan);
      });
      setPlans(docs);
    }, (error) => {
      console.error("Firestore plans listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Sync: Comments
  useEffect(() => {
    const commentsRef = collection(db, 'comments');

    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const docs: CommentItem[] = [];
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      snapshot.forEach(docSnap => {
        const item = docSnap.data() as CommentItem;
        const createdTime = new Date(item.createdAt).getTime();

        // Auto-delete comments older than 30 days (1 month)
        if (!isNaN(createdTime) && (now - createdTime) > thirtyDaysMs) {
          deleteDoc(doc(db, 'comments', docSnap.id)).catch(console.error);
        } else {
          docs.push(item);
        }
      });

      // Sort newest comments first
      docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setComments(docs);
    }, (error) => {
      console.error("Firestore comments listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Actions
  const addMovie = async (movieData: Omit<MovieItem, 'id' | 'addedAt'>) => {
    const now = new Date();
    const timestamp = now.getTime();
    const newMovie: MovieItem = {
      ...movieData,
      id: 'det-' + timestamp,
      order: 0, // Ensure brand new card takes the #1 top spot (index 0)
      addedAt: now.toISOString().split('T')[0],
      createdAt: now.toISOString()
    };

    // Re-index existing movies so new movie is strictly at the top
    const updatedExisting = movies.map((m, idx) => ({
      ...m,
      order: idx + 1
    }));

    // Optimistic UI state with new movie at index 0 (top)
    setMovies([newMovie, ...updatedExisting]);

    try {
      // Save new movie with order 0
      await setDoc(doc(db, 'movies', newMovie.id), cleanUndefined(newMovie));

      // Update remaining movies order in Firestore to preserve order sequence
      const orderUpdates = updatedExisting.map(m =>
        updateDoc(doc(db, 'movies', m.id), { order: m.order }).catch(() => {})
      );
      await Promise.all(orderUpdates);
    } catch (err) {
      console.error("Failed to add movie to Firestore:", err);
      // Fallback local state prepend
      setMovies(prev => [newMovie, ...prev.filter(m => m.id !== newMovie.id)]);
    }
  };

  const updateMovie = async (updated: MovieItem) => {
    try {
      await setDoc(doc(db, 'movies', updated.id), cleanUndefined(updated), { merge: true });
      if (selectedMovie && selectedMovie.id === updated.id) {
        setSelectedMovie(updated);
      }
    } catch (err) {
      console.error("Failed to update movie in Firestore:", err);
      setMovies(prev => prev.map(m => m.id === updated.id ? updated : m));
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movies', id));
      if (selectedMovie && selectedMovie.id === id) {
        setSelectedMovie(null);
      }
    } catch (err) {
      console.error("Failed to delete movie from Firestore:", err);
      setMovies(prev => prev.filter(m => m.id !== id));
    }
  };

  const moveMovieUp = async (movieId: string) => {
    const currentIndex = movies.findIndex(m => m.id === movieId);
    if (currentIndex <= 0) return;

    const targetIndex = currentIndex - 1;
    const reordered = [...movies];
    const itemToMove = reordered[currentIndex];
    reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, itemToMove);

    // Assign clean sequential order numbers (0, 1, 2, 3...)
    const updatedWithOrder = reordered.map((m, idx) => ({
      ...m,
      order: idx
    }));

    // Immediate UI feedback
    setMovies(updatedWithOrder);

    try {
      const promises = updatedWithOrder.map(m =>
        updateDoc(doc(db, 'movies', m.id), { order: m.order })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to persist movie order up to Firestore:", err);
    }
  };

  const moveMovieDown = async (movieId: string) => {
    const currentIndex = movies.findIndex(m => m.id === movieId);
    if (currentIndex === -1 || currentIndex >= movies.length - 1) return;

    const targetIndex = currentIndex + 1;
    const reordered = [...movies];
    const itemToMove = reordered[currentIndex];
    reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, itemToMove);

    // Assign clean sequential order numbers (0, 1, 2, 3...)
    const updatedWithOrder = reordered.map((m, idx) => ({
      ...m,
      order: idx
    }));

    // Immediate UI feedback
    setMovies(updatedWithOrder);

    try {
      const promises = updatedWithOrder.map(m =>
        updateDoc(doc(db, 'movies', m.id), { order: m.order })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to persist movie order down to Firestore:", err);
    }
  };

  const addComment = async (movieId: string, userName: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const now = new Date();
    const commentId = 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newComment: CommentItem = {
      id: commentId,
      movieId,
      userName: userName.trim() || 'User',
      text: trimmedText,
      createdAt: now.toISOString()
    };

    // Update state immediately for instant UI feedback
    setComments(prev => [newComment, ...prev.filter(c => c.id !== commentId)]);

    try {
      await setDoc(doc(db, 'comments', commentId), cleanUndefined(newComment));
    } catch (err) {
      console.error("Failed to add comment to Firestore:", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error("Failed to delete comment from Firestore:", err);
    }
  };

  const addCommentReply = async (commentId: string, userName: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const now = new Date();
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;

    const newReply = {
      id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userName: userName.trim() || 'User',
      text: trimmedText,
      createdAt: now.toISOString()
    };

    const updatedReplies = [...(targetComment.replies || []), newReply];
    const updatedComment = { ...targetComment, replies: updatedReplies };

    // Update state immediately
    setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));

    try {
      await setDoc(doc(db, 'comments', commentId), cleanUndefined(updatedComment), { merge: true });
    } catch (err) {
      console.error("Failed to add reply to Firestore:", err);
    }
  };

  const deleteCommentReply = async (commentId: string, replyId: string) => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment || !targetComment.replies) return;

    const updatedReplies = targetComment.replies.filter(r => r.id !== replyId);
    const updatedComment = { ...targetComment, replies: updatedReplies };

    setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));

    try {
      await setDoc(doc(db, 'comments', commentId), cleanUndefined(updatedComment), { merge: true });
    } catch (err) {
      console.error("Failed to delete reply from Firestore:", err);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'appSettings', 'main'), cleanUndefined(updated), { merge: true });
    } catch (err) {
      console.error("Failed to update settings in Firestore:", err);
      setSettings(updated);
    }
  };

  const setUserPlan = (plan: PlanType) => {
    setUser(prev => ({
      ...prev,
      plan,
      planExpiry: plan !== 'free' ? 'Valid for 30 days' : undefined
    }));
  };

  const toggleMyList = (movieId: string) => {
    setUser(prev => {
      const exists = prev.myList.includes(movieId);
      return {
        ...prev,
        myList: exists
          ? prev.myList.filter(id => id !== movieId)
          : [...prev.myList, movieId]
      };
    });
  };

  const resetToDefaults = async () => {
    try {
      // Re-seed movies
      INITIAL_MOVIES.forEach(m => {
        setDoc(doc(db, 'movies', m.id), cleanUndefined(m)).catch(console.error);
      });
      await setDoc(doc(db, 'appSettings', 'main'), cleanUndefined(DEFAULT_SETTINGS));
    } catch (err) {
      console.error("Error resetting defaults:", err);
    }
    setUser({
      name: 'User',
      email: 'user@detflix.tv',
      plan: 'free',
      myList: ['det-1', 'det-2']
    });
  };

  return (
    <AppContext.Provider
      value={{
        movies,
        comments,
        settings,
        plans,
        user,
        selectedMovie,
        setSelectedMovie: handleSetSelectedMovie,
        isSubscriptionOpen,
        setIsSubscriptionOpen,
        isDownloadModalOpen,
        setIsDownloadModalOpen,
        isAdminOpen,
        setIsAdminOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedGenre,
        setSelectedGenre,
        addMovie,
        updateMovie,
        deleteMovie,
        addComment,
        deleteComment,
        addCommentReply,
        deleteCommentReply,
        updateSettings,
        setUserPlan,
        toggleMyList,
        incrementMovieView,
        moveMovieUp,
        moveMovieDown,
        resetAllViews,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
