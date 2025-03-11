export const logError = (error) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    response: error.response ? {
      status: error.response.status,
      data: error.response.data
    } : null
  }

  // Send error to logging service
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorData)
  } else {
    console.error('Error:', errorData)
  }
}

export const handleApiError = (error) => {
  logError(error)
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return 'Authentication failed. Please login again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 429:
        return 'Too many requests. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  } else if (error.request) {
    return 'Network error. Please check your internet connection.'
  } else {
    return 'An unexpected error occurred. Please try again.'
  }
}
