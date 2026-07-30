// Formatting utilities

export const formatters = {
  // Format date
  date: (timestamp, format = 'default') => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';

    const options = {
      default: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      short: {
        month: 'short',
        day: 'numeric',
      },
      long: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
      },
    };

    return date.toLocaleDateString('en-US', options[format] || options.default);
  },

  // Format relative time (e.g., "2 hours ago")
  relativeTime: (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  },

  // Format number with commas
  number: (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-US');
  },

  // Format word count
  wordCount: (text) => {
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  },

  // Format reading time
  readingTime: (text, wordsPerMinute = 200) => {
    const count = formatters.wordCount(text);
    const minutes = Math.ceil(count / wordsPerMinute);
    return `${minutes} min read`;
  },

  // Truncate text
  truncate: (text, maxLength, suffix = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Capitalize first letter
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Title case
  titleCase: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Slugify
  slugify: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  },

  // Format file size
  fileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Format progress percentage
  progress: (current, total) => {
    if (total === 0) return 0;
    const pct = (current / total) * 100;
    return Math.min(Math.round(pct), 100);
  },
};

// Export as object for easy import
export const format = formatters;
