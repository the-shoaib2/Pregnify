import api from '../api'

export const MediaService = {
  // Profile Image
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/media/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Other Media
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

  deleteMedia: (mediaId) => api.delete(`/media/${mediaId}`),
  getMediaList: () => api.get('/media'),
} 