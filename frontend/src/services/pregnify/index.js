import api from '../api'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { handleApiError } from '../../utils/errorHandler'


const { CACHE_DURATION } = CONSTANTS
const CACHE_KEY = CONSTANTS.AUTH_CACHE_KEY

// System Enums
export const SYSTEM_ENUMS = {
  ROLES: {
    GUEST: 'GUEST',
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    AMBULANCE_DRIVER: 'AMBULANCE_DRIVER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
  },
  PREGNANCY_STATUS: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    TERMINATED: 'TERMINATED'
  },
  APPOINTMENT_STATUS: {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    RESCHEDULED: 'RESCHEDULED'
  },
  EMERGENCY_STATUS: {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },
  RISK_LEVEL: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  }
}

// Base endpoints
const PREGNANCY_ENDPOINTS = {
  BASE: '/pregnify/pregnancy',
  TRACKING: '/pregnify/pregnancy/tracking',
  HEALTH: '/pregnify/pregnancy/health',
  BABY: '/pregnify/pregnancy/baby',
  NUTRITION: '/pregnify/pregnancy/nutrition',
  EXERCISE: '/pregnify/pregnancy/exercise',
  MENTAL_HEALTH: '/pregnify/pregnancy/mental-health',
  RISK: '/pregnify/pregnancy/risk',
  AI: '/pregnify/pregnancy/ai'
}

const DOCTOR_ENDPOINTS = {
  PROFILE: '/pregnify/doctor/profile',
  APPOINTMENT: '/pregnify/doctor/appointment',
  CHAT: '/pregnify/doctor/chat',
  CALL: '/pregnify/doctor/call',
  REVIEW: '/pregnify/doctor/review'
}

const AMBULANCE_ENDPOINTS = {
  BOOKING: '/pregnify/ambulance/booking',
  DRIVER: '/pregnify/ambulance/driver'
}

const EMERGENCY_ENDPOINTS = {
  BASE: '/pregnify/emergency'
}

// Track ongoing requests
const requestCache = new Map()

// Role-based access control
const checkRoleAccess = (requiredRole, userRole) => {
  if (!userRole) return false
  
  const roleHierarchy = {
    [SYSTEM_ENUMS.ROLES.SUPER_ADMIN]: 4,
    [SYSTEM_ENUMS.ROLES.ADMIN]: 3,
    [SYSTEM_ENUMS.ROLES.DOCTOR]: 2,
    [SYSTEM_ENUMS.ROLES.AMBULANCE_DRIVER]: 2,
    [SYSTEM_ENUMS.ROLES.PATIENT]: 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Get user role from cache
const getUserRole = () => {
  const cache = CacheManager.get(CACHE_KEY)
  return cache?.user?.basicInfo?.role || cache?.user?.role
}

// Pregnancy Service with role-based access
export const PregnancyService = {
  // Pregnancy Information
  getPregnancyDetails: async () => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      const response = await api.get(PREGNANCY_ENDPOINTS.BASE)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  createPregnancyRecord: async (data) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      const response = await api.post(PREGNANCY_ENDPOINTS.BASE, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updatePregnancyDetails: async (id, data) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      const response = await api.put(`${PREGNANCY_ENDPOINTS.BASE}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deletePregnancyRecord: async () => {
    try {
      const response = await api.delete(PREGNANCY_ENDPOINTS.BASE)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Pregnancy Tracking
  getTrackingData: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.TRACKING)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addTrackingEntry: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.TRACKING, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateTrackingEntry: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.TRACKING}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteTrackingEntry: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.TRACKING}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Health Monitoring
  getHealthData: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.HEALTH)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addHealthRecord: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.HEALTH, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateHealthRecord: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.HEALTH}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteHealthRecord: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.HEALTH}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Baby Development
  getBabyDevelopment: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.BABY)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addDevelopmentRecord: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.BABY, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateDevelopmentRecord: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.BABY}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteDevelopmentRecord: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.BABY}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Nutrition Tracking
  getNutritionRecords: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.NUTRITION)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addNutritionEntry: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.NUTRITION, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateNutritionEntry: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.NUTRITION}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteNutritionEntry: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.NUTRITION}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Exercise Tracking
  getExerciseRecords: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.EXERCISE)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addExerciseEntry: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.EXERCISE, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateExerciseEntry: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.EXERCISE}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteExerciseEntry: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.EXERCISE}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Mental Health
  getMentalHealthRecords: async () => {
    try {
      const response = await api.get(PREGNANCY_ENDPOINTS.MENTAL_HEALTH)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addMentalHealthEntry: async (data) => {
    try {
      const response = await api.post(PREGNANCY_ENDPOINTS.MENTAL_HEALTH, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateMentalHealthEntry: async (id, data) => {
    try {
      const response = await api.put(`${PREGNANCY_ENDPOINTS.MENTAL_HEALTH}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteMentalHealthEntry: async (id) => {
    try {
      const response = await api.delete(`${PREGNANCY_ENDPOINTS.MENTAL_HEALTH}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Risk Assessment & AI Prediction
  getRiskAssessment: async (pregnancyId) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      
      if (!pregnancyId) {
        throw new Error('Pregnancy ID is required')
      }
      
      const response = await api.get(`${PREGNANCY_ENDPOINTS.RISK}/pregnancies/${pregnancyId}/risk-assessments/latest`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  getRiskAssessmentHistory: async (pregnancyId) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      
      if (!pregnancyId) {
        throw new Error('Pregnancy ID is required')
      }
      
      const response = await api.get(`${PREGNANCY_ENDPOINTS.RISK}/pregnancies/${pregnancyId}/risk-assessments`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  performRiskAssessment: async (pregnancyId, data) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      const response = await api.post(`${PREGNANCY_ENDPOINTS.RISK}/pregnancies/${pregnancyId}/risk-assessments`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  getAIPredictions: async (pregnancyId) => {
    try {
      const response = await api.get(`${PREGNANCY_ENDPOINTS.AI}/pregnancies/${pregnancyId}/ai-prediction`, {
        headers: {
          'Accept': 'text/event-stream'
        }
      })
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Stream AI predictions
  streamAIPredictions: async (pregnancyId, onData, onError, onComplete) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }

      if (!pregnancyId) {
        throw new Error('Pregnancy ID is required')
      }
      
      const response = await fetch(`${api.defaults.baseURL}${PREGNANCY_ENDPOINTS.AI}/pregnancies/${pregnancyId}/ai-prediction`, {
        headers: {
          'Authorization': `Bearer ${CacheManager.get(CACHE_KEY)?.token}`,
          'Accept': 'text/event-stream'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer)
              onData(data)
            } catch (e) {
              console.error('Error parsing final buffer:', e)
            }
          }
          if (onComplete) onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        
        // Process complete messages in the buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6)
              const data = JSON.parse(jsonStr)
              onData(data)
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streamAIPredictions:', error)
      if (onError) onError(error)
    }
  },

  requestAIPrediction: async (pregnancyId, data) => {
    try {
      const response = await api.post(`${PREGNANCY_ENDPOINTS.AI}/pregnancies/${pregnancyId}/ai-prediction`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  }
}

// Doctor Service with role-based access
export const DoctorService = {
  // Doctor Profile
  getDoctorProfiles: async () => {
    try {
      const response = await api.get(DOCTOR_ENDPOINTS.PROFILE)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  getDoctorProfile: async (id) => {
    try {
      const response = await api.get(`${DOCTOR_ENDPOINTS.PROFILE}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  createDoctorProfile: async (data) => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.ADMIN, userRole)) {
        throw new Error('Access denied: Admin role required')
      }
      const response = await api.post(DOCTOR_ENDPOINTS.PROFILE, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateDoctorProfile: async (id, data) => {
    try {
      const response = await api.put(`${DOCTOR_ENDPOINTS.PROFILE}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteDoctorProfile: async (id) => {
    try {
      const response = await api.delete(`${DOCTOR_ENDPOINTS.PROFILE}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Appointments
  getAppointments: async () => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole) && 
          !checkRoleAccess(SYSTEM_ENUMS.ROLES.DOCTOR, userRole)) {
        throw new Error('Access denied: Patient or Doctor role required')
      }
      const response = await api.get(DOCTOR_ENDPOINTS.APPOINTMENT)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  bookAppointment: async (data) => {
    try {
      const response = await api.post(DOCTOR_ENDPOINTS.APPOINTMENT, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateAppointment: async (id, data) => {
    try {
      const response = await api.put(`${DOCTOR_ENDPOINTS.APPOINTMENT}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await api.delete(`${DOCTOR_ENDPOINTS.APPOINTMENT}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Communication
  getChatHistory: async () => {
    try {
      const response = await api.get(DOCTOR_ENDPOINTS.CHAT)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  sendMessage: async (data) => {
    try {
      const response = await api.post(DOCTOR_ENDPOINTS.CHAT, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateMessage: async (id, data) => {
    try {
      const response = await api.put(`${DOCTOR_ENDPOINTS.CHAT}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteMessage: async (id) => {
    try {
      const response = await api.delete(`${DOCTOR_ENDPOINTS.CHAT}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Video Call
  initiateVideoCall: async (data) => {
    try {
      const response = await api.post(DOCTOR_ENDPOINTS.CALL, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  getCallDetails: async (id) => {
    try {
      const response = await api.get(`${DOCTOR_ENDPOINTS.CALL}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateCallStatus: async (id, data) => {
    try {
      const response = await api.put(`${DOCTOR_ENDPOINTS.CALL}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Reviews
  getDoctorReviews: async () => {
    try {
      const response = await api.get(DOCTOR_ENDPOINTS.REVIEW)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addReview: async (data) => {
    try {
      const response = await api.post(DOCTOR_ENDPOINTS.REVIEW, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateReview: async (id, data) => {
    try {
      const response = await api.put(`${DOCTOR_ENDPOINTS.REVIEW}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  deleteReview: async (id) => {
    try {
      const response = await api.delete(`${DOCTOR_ENDPOINTS.REVIEW}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  }
}

// Ambulance Service with role-based access
export const AmbulanceService = {
  // Ambulance Booking
  getAmbulanceBookings: async () => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole) && 
          !checkRoleAccess(SYSTEM_ENUMS.ROLES.AMBULANCE_DRIVER, userRole)) {
        throw new Error('Access denied: Patient or Ambulance Driver role required')
      }
      const response = await api.get(AMBULANCE_ENDPOINTS.BOOKING)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  bookAmbulance: async (data) => {
    try {
      const response = await api.post(AMBULANCE_ENDPOINTS.BOOKING, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateBooking: async (id, data) => {
    try {
      const response = await api.put(`${AMBULANCE_ENDPOINTS.BOOKING}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  cancelBooking: async (id) => {
    try {
      const response = await api.delete(`${AMBULANCE_ENDPOINTS.BOOKING}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  // Ambulance Driver
  getDriverInfo: async () => {
    try {
      const response = await api.get(AMBULANCE_ENDPOINTS.DRIVER)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  addDriver: async (data) => {
    try {
      const response = await api.post(AMBULANCE_ENDPOINTS.DRIVER, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateDriver: async (id, data) => {
    try {
      const response = await api.put(`${AMBULANCE_ENDPOINTS.DRIVER}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  removeDriver: async (id) => {
    try {
      const response = await api.delete(`${AMBULANCE_ENDPOINTS.DRIVER}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  }
}

// Emergency Service with role-based access
export const EmergencyService = {
  getEmergencyContacts: async () => {
    try {
      const userRole = getUserRole()
      if (!checkRoleAccess(SYSTEM_ENUMS.ROLES.PATIENT, userRole)) {
        throw new Error('Access denied: Patient role required')
      }
      const response = await api.get(EMERGENCY_ENDPOINTS.BASE)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  createEmergencyAlert: async (data) => {
    try {
      const response = await api.post(EMERGENCY_ENDPOINTS.BASE, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  updateEmergencyStatus: async (id, data) => {
    try {
      const response = await api.put(`${EMERGENCY_ENDPOINTS.BASE}/${id}`, data)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  },

  cancelEmergency: async (id) => {
    try {
      const response = await api.delete(`${EMERGENCY_ENDPOINTS.BASE}/${id}`)
      return response.data
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  }
}

// Export all services and enums
export default {
  SYSTEM_ENUMS,
  PregnancyService,
  DoctorService,
  AmbulanceService,
  EmergencyService
}

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
  DOCTOR: "DOCTOR",
  GUEST: "GUEST"
}