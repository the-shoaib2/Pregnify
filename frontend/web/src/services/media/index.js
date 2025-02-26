import api from '../api'

// Export the constants
export const FileType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT'
}

export const FileCategory = {
  PROFILE: 'PROFILE',
  COVER: 'COVER',
  POST: 'POST',
  PERSONAL: 'PERSONAL'
}

export const Visibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  FRIENDS: 'FRIENDS',
  CUSTOM: 'CUSTOM'
}

export const ShareType = {
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
  ANGRY: 'ANGRY'
}

export const MediaService = {
  fileUpload: async (file, options = {}) => {
    try {
      if (!file) {
        throw new Error('File is required')
      }

      const formData = new FormData()

      // Add file
      formData.append('file', file)

      // Required fields - use encodeURIComponent for values
      formData.append('fileType', encodeURIComponent('IMAGE'))
      formData.append('fileCategory', encodeURIComponent(options.fileCategory))
      formData.append('visibility', encodeURIComponent('PUBLIC'))
      formData.append('title', encodeURIComponent(' '))

      // Optional fields
      formData.append('description', encodeURIComponent(options.description || ''))
      formData.append('allowComments', encodeURIComponent('true'))
      formData.append('allowSharing', encodeURIComponent('true'))
      formData.append('allowDownload', encodeURIComponent('true'))
      formData.append('customAudience', encodeURIComponent('""'))

      // Log the request
      const requestData = {}
      formData.forEach((value, key) => {
        requestData[key] = value instanceof File ? `File: ${value.name}` : value
      })
      console.log('Request data:', requestData)

      const response = await api.post('/media/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary' + Math.random().toString(36).substring(2),
        },
        transformRequest: [(data) => data],
        onUploadProgress: options.onProgress
      })

      return response
    } catch (error) {
      if (error.response?.data) {
        const match = error.response.data.match(/Error: ([^<]+)/)
        const message = match ? match[1].trim() : 'Upload failed'
        throw new Error(message)
      }
      throw error
    }
  },

  // API endpoints
  getAllImages: () => api.get('/media/images'),
  getImageById: (imageId) => api.get(`/media/files/${imageId}`),
  updateImage: (imageId, updateData) => api.put(`/media/files/${imageId}`, updateData),
  deleteImage: (imageId) => api.delete(`/media/files/${imageId}`),
  addReaction: (imageId, type) => api.post(`/media/files/react/${imageId}`, { type }),
  addComment: (imageId, content) => api.post(`/media/files/comment/${imageId}`, { content }),
  
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