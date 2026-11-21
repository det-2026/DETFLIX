export interface CommentReply {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  movieId: string;
  userName: string;
  text: string;
  createdAt: string;
  replies?: CommentReply[];
}

export type ContentType = 'movie' | 'drama' | 'web-series' | 'anime';

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  thumbnailUrl: string;
  watchUrl?: string;
}

export interface MovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: ContentType;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string; // YouTube embed link or video URL
  watchUrl?: string;  // Streaming or direct link
  telegramChannelUrl?: string; // Specific Telegram channel for this movie/series
  releaseYear: number;
  rating: number; // e.g. 8.5
  duration: string; // e.g., "4h 15m" or "70 Episodes"
  genres: string[];
  languages: string[];
  isVip: boolean; // true = VIP/Subscription Required, false = Free
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  order?: number;
  views?: string;
  viewsCount?: number;
  cast: string[];
  director?: string;
  episodes?: Episode[];
  addedAt: string;
  createdAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string; // e.g., "1 Month", "1 Year"
  badge: string;
  color: string;
  features: string[];
  isPopular?: boolean;
}

export interface AppSettings {
  appName: string;
  telegramChannelUrl: string;
  telegramChannelName: string;
  telegramMemberCount: string;
  telegramViewsCount?: string;
  totalAppViews?: number;
  googleAnalyticsId?: string;
  noticeText: string;
  upiPaymentId: string;
  adminPin: string;
}

export type PlanType = 'free' | 'basic' | 'vip' | 'ultra';

export interface UserProfile {
  name: string;
  email: string;
  plan: PlanType;
  planExpiry?: string;
  myList: string[]; // array of movie IDs
}
