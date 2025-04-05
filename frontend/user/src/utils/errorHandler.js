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
  
  // Check if the error is a network error
  if (error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.'
  }
  
  if (error.response) {
    // Extract error message from response if available
    const serverMessage = error.response.data?.message || error.response.data?.error
    
    if (serverMessage) {
      return serverMessage
    }
    
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication failed. Please login again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 422:
        return 'Validation error. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return `Error ${error.response.status}: An unexpected error occurred.`
    }
  } else if (error.request) {
    return 'Network error. Please check your internet connection.'
  } else {
    return error.message || 'An unexpected error occurred. Please try again.'
  }
}

// Add a retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain status codes
      if (error.response && [400, 401, 403, 404, 422].includes(error.response.status)) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
    }
  }
  
  throw lastError
}
