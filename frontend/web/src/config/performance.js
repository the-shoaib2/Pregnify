export const PERFORMANCE_CONFIG = {
  // Image optimization
  images: {
    thumbnailQuality: 60,
    thumbnailSize: {
      width: 160,
      height: 160
    },
    lazyLoadOffset: '50px',
    placeholderColor: '#f3f4f6'
  },

  // Component loading
  loading: {
    timeout: 3000,
    retryCount: 3,
    retryDelay: 1000
  },

  // Cache configuration
  cache: {
    profileTTL: 5 * 60 * 1000, // 5 minutes
    imageTTL: 24 * 60 * 60 * 1000 // 24 hours
  }
} 