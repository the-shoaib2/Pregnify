import api from '../api'

// Export the constants
export const FileType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  AUDIO: 'AUDIO'
}

export const FileCategory = {
  PROFILE: 'PROFILE',
  COVER: 'COVER',
  POST: 'POST',
  PERSONAL: 'PERSONAL',
  GROUP: 'GROUP',
  EVENT: 'EVENT',
  STORY: 'STORY',
  MESSAGE: 'MESSAGE',
  NOTIFICATION: 'NOTIFICATION'
}

export const Visibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  FRIENDS: 'FRIENDS',
  CUSTOM: 'CUSTOM'
}

export const ShareType = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
  LINK: 'LINK'
}

export const ReactionType = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HAHA: 'HAHA',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY',
  CARE: 'CARE',
  SUPPORT: 'SUPPORT'
}

const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error)
  const errorMessage = error.response?.data?.message || defaultMessage
  throw new Error(errorMessage)
}

export const MediaService = {
  getMediaEnums:async () => {
    try {
      const response = await api.get('/media/enums')
      console.log("API /media/enums :",response)
      return { data: response.data?.data || [] }
    } catch (error) {
      handleApiError(error, 'Failed to fetch files')
    }
  },

  getFiles:async () => {
    try {
      const response = await api.get('/media/files')
      console.log("API /media/files :",response)
      return { data: response.data?.data || [] }
    } catch (error) {
      handleApiError(error, 'Failed to fetch files')
    }
  },
  getFilesById: async (fileId) => {
    try {
      const response = await api.get(`/media/files/${fileId}`)
      console.log("API /media/files/${fileId}  :",response)
      return { data: response.data?.data || null }
    } catch (error) {
      handleApiError(error, 'Failed to fetch files')
    }
  },

  getFilesByType: async (fileType) => {
    try {
      const response = await api.get(`/media/files/type/${fileType}`)
      return { data: response.data?.data || [] }
    } catch (error) {
      handleApiError(error, 'Failed to fetch files')
    }
  },

  getFilesByCategory: async (category) => {
    try {
      const response = await api.get(`/media/files/category/${category}`)
      return { data: response.data?.data || [] }
    } catch (error) {
      handleApiError(error, 'Failed to fetch files')
    }
  },

  fileUpload: async (file, options = {}) => {
    try {
      if (!file) {
        throw new Error('File is required')
      }

      const formData = new FormData()
      formData.append('file', file)
      
      // Required fields
      formData.append('type', FileType.IMAGE)
      formData.append('category', options.fileCategory || FileCategory.POST)
      
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: options.onProgress
      })

      return response
    } catch (error) {
      handleApiError(error, 'Failed to upload file')
    }
  },

  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/media/files/${imageId}`)
      return response
    } catch (error) {
      handleApiError(error, 'Failed to delete image')
    }
  },

  // API endpoints
  getAllImages: async () => {
    try {
      const response = await api.get('/media/images')
      return { data: response.data?.data || [] }
    } catch (error) {
      handleApiError(error, 'Failed to fetch images')
    }
  },

  getImageById: async (imageId) => {
    try {
      const response = await api.get(`/media/files/${imageId}`)
      return { data: response.data?.data || null }
    } catch (error) {
      handleApiError(error, 'Failed to fetch image')
    }
  },

  updateImage: async (imageId, updateData) => {
    try {
      const response = await api.put(`/media/files/${imageId}`, updateData)
      return { data: response.data?.data || null }
    } catch (error) {
      handleApiError(error, 'Failed to update image')
    }
  },

  addReaction: async (imageId, type) => {
    try {
      const response = await api.post(`/media/files/react/${imageId}`, { type })
      return { data: response.data?.data || null }
    } catch (error) {
      handleApiError(error, 'Failed to add reaction')
    }
  },

  addComment: async (imageId, content) => {
    try {
      const response = await api.post(`/media/files/comment/${imageId}`, { content })
      return { data: response.data?.data || null }
    } catch (error) {
      handleApiError(error, 'Failed to add comment')
    }
  },
  
  shareImage: (imageId, shareData) => {
    return api.post(`/media/files/share/${imageId}`, {
      sharedWith: shareData.sharedWith,
      shareType: shareData.shareType || 'DIRECT',
      message: shareData.message,
      visibility: shareData.visibility || 'PRIVATE',
      permissions: {
        canEdit: shareData.permissions?.canEdit || false,
        canShare: shareData.permissions?.canShare || false,
        canDownload: shareData.permissions?.canDownload || true
      },
      expiresAt: shareData.expiresAt
    })
  },

  // Documents
  uploadDocument: (file, type) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    return api.post('/media/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Other Media Operations
  getMediaList: () => api.get('/media'),
  deleteMedia: (mediaId) => api.delete(`/media/${mediaId}`),
}

export default MediaService