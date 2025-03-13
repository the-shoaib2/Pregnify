import api from '../api'

// Re-export the API instance
export default api

// Export common API utilities
export const apiUtils = {
  // Helper for handling paginated requests
  getPaginated: async (endpoint, params = {}) => {
    const response = await api.get(endpoint, { params })
    return response.data
  },
  
  // Helper for creating resources
  create: async (endpoint, data) => {
    const response = await api.post(endpoint, data)
    return response.data
  },
  
  // Helper for updating resources
  update: async (endpoint, id, data) => {
    const response = await api.put(`${endpoint}/${id}`, data)
    return response.data
  },
  
  // Helper for patching resources
  patch: async (endpoint, id, data) => {
    const response = await api.patch(`${endpoint}/${id}`, data)
    return response.data
  },
  
  // Helper for deleting resources
  delete: async (endpoint, id) => {
    const response = await api.delete(`${endpoint}/${id}`)
    return response.data
  }
} 