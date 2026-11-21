/**
 * Helper to ensure YouTube URLs are converted to embeddable format
 */
export function getEmbedUrl(url: string | undefined): string {
  if (!url) return '';
  
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  } else if (url.includes('youtube.com/embed/')) {
    const parts = url.split('?')[0].split('/embed/');
    if (parts[1]) {
      videoId = parts[1];
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&enablejsapi=1&rel=0`;
  }

  return url;
}

/**
 * Get YouTube embed URL with autoplay, muted and loop for card hover preview
 */
export function getAutoplayTrailerUrl(url: string | undefined, isMuted: boolean = true): string {
  if (!url) return '';
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  let videoId = '';
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else if (url.includes('youtube.com/embed/')) {
    const parts = url.split('?')[0].split('/embed/');
    if (parts[1]) {
      videoId = parts[1].split('?')[0];
    }
  }

  if (videoId) {
    const muteParam = isMuted ? '&mute=1' : '&mute=0';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1${muteParam}&controls=0&loop=1&playlist=${videoId}&enablejsapi=1&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1`;
  }

  return url;
}

/**
 * Format rating with star icon score
 */
export function formatRating(rating: number): string {
  return rating ? rating.toFixed(1) : 'N/A';
}

/**
 * Default sample poster photos for quick picker in Admin Panel
 */
export const PRESET_POSTERS = [
  { name: 'Action Thriller', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop' },
  { name: 'K-Drama Romance', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop' },
  { name: 'Sci-Fi Cyber', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
  { name: 'Crime / Heist', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Horror / Survival', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop' },
  { name: 'Cinema Hall', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop' },
];

export const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Drama', 'Love Story', 'Romance', 'K-Drama', 'J-Drama', 'C-Drama',
  'Indian', 'History', 'Netflix', 'Netflix Originals', 'Bollywood', 'South Indian',
  'Thriller', 'Comedy', 'Web Series', 'Horror', 'Sci-Fi', 'Crime', 'Mythology', 'Anime', 'Mystery'
];

export const LANGUAGE_OPTIONS = [
  'Hindi', 'Hindi Dubbed', 'English', 'Gujarati', 'Japanese', 'Japanese Dubbed', 'Chinese', 'Chinese Dubbed', 'Korean', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'
];

/**
 * Format timestamp to relative time ago (e.g., "Just now", "5m ago", "2h ago", "1 month ago")
 */
export function formatTimeAgo(dateString: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

