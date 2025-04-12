/**
 * AI Model Configuration
 * This file contains configuration for different AI models used in the application
 */

// AI Model Types
const AI_MODEL_TYPES = {
    
    RISK_PREDICTION: 'risk_prediction',
    SYMPTOM_ANALYSIS: 'symptom_analysis',
    NUTRITION_ADVICE: 'nutrition_advice',
    EXERCISE_RECOMMENDATION: 'exercise_recommendation',
    MENTAL_HEALTH: 'mental_health',
    EMERGENCY_ASSESSMENT: 'emergency_assessment',
    TELEMEDICINE: 'telemedicine'
};

// Base AI Model Configuration
const BASE_AI_CONFIG = {
    version: '1.0.0',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    fallbackModel: 'gpt-3.5-turbo'
};

// Bangladesh-specific Risk Factors
const BANGLADESH_RISK_FACTORS = {
    // Medical Risk Factors
    MEDICAL: {
        ANEMIA: { weight: 0.15, threshold: 11 }, // Hemoglobin level threshold
        GESTATIONAL_DIABETES: { weight: 0.2 },
        HYPERTENSION: { weight: 0.2 },
        MALNUTRITION: { weight: 0.15 },
        INFECTIONS: { weight: 0.1 }
    },
    // Socioeconomic Risk Factors
    SOCIOECONOMIC: {
        LOW_INCOME: { weight: 0.1 },
        RURAL_AREA: { weight: 0.1 },
        LOW_EDUCATION: { weight: 0.05 },
        POOR_SANITATION: { weight: 0.1 }
    },
    // Healthcare Access Factors
    HEALTHCARE: {
        DISTANCE_TO_HOSPITAL: { weight: 0.1 },
        QUALITY_OF_CARE: { weight: 0.1 },
        EMERGENCY_ACCESS: { weight: 0.15 }
    }
};

// Bangladesh-specific Validation Rules
const BANGLADESH_VALIDATION_RULES = {
    MEDICAL: {
        BMI_THRESHOLD: 18.5,
        BLOOD_PRESSURE: {
            SYSTOLIC: 140,
            DIASTOLIC: 90
        }
    },
    OCCUPATION: {
        HIGH_RISK: ['agriculture', 'manual labor']
    },
    LOCATION: {
        HIGH_RISK: ['rural']
    }
};

// Model-specific configurations
const MODEL_CONFIGS = {
    [AI_MODEL_TYPES.RISK_PREDICTION]: {
        model: 'gpt-4',
        contextWindow: 8000,
        temperature: 0.3, // Lower temperature for more deterministic risk predictions
        features: [
            'pregnancy_risk_assessment',
            'complication_prediction',
            'risk_factor_analysis'
        ],
        inputFields: [
            'medical_history',
            'current_symptoms',
            'vital_signs',
            'pregnancy_week',
            'previous_pregnancies'
        ],
        riskFactors: BANGLADESH_RISK_FACTORS,
        validationRules: BANGLADESH_VALIDATION_RULES,
        apiConfig: {
            maxRetries: 3,
            initialDelay: 1000,
            exponentialBackoff: true
        }
    },
    [AI_MODEL_TYPES.SYMPTOM_ANALYSIS]: {
        model: 'gpt-3.5-turbo',
        contextWindow: 4000,
        temperature: 0.5,
        features: [
            'symptom_classification',
            'severity_assessment',
            'recommendation_generation'
        ],
        inputFields: [
            'symptom_description',
            'duration',
            'intensity',
            'associated_factors'
        ]
    },
    [AI_MODEL_TYPES.NUTRITION_ADVICE]: {
        model: 'gpt-4',
        contextWindow: 4000,
        temperature: 0.6,
        features: [
            'diet_planning',
            'nutrient_analysis',
            'meal_suggestions'
        ],
        inputFields: [
            'current_diet',
            'dietary_restrictions',
            'pregnancy_stage',
            'health_conditions'
        ]
    },
    [AI_MODEL_TYPES.EXERCISE_RECOMMENDATION]: {
        model: 'gpt-3.5-turbo',
        contextWindow: 4000,
        temperature: 0.5,
        features: [
            'exercise_planning',
            'intensity_guidance',
            'safety_assessment'
        ],
        inputFields: [
            'fitness_level',
            'pregnancy_stage',
            'health_conditions',
            'previous_exercise'
        ]
    },
    [AI_MODEL_TYPES.MENTAL_HEALTH]: {
        model: 'gpt-4',
        contextWindow: 4000,
        temperature: 0.7,
        features: [
            'mood_analysis',
            'stress_assessment',
            'coping_strategies'
        ],
        inputFields: [
            'mood_logs',
            'stress_levels',
            'sleep_patterns',
            'life_events'
        ]
    },
    [AI_MODEL_TYPES.EMERGENCY_ASSESSMENT]: {
        model: 'gpt-4',
        contextWindow: 4000,
        temperature: 0.2, // Very low temperature for emergency situations
        features: [
            'emergency_triage',
            'symptom_severity',
            'immediate_actions'
        ],
        inputFields: [
            'current_symptoms',
            'vital_signs',
            'medical_history',
            'location'
        ]
    },
    [AI_MODEL_TYPES.TELEMEDICINE]: {
        model: 'gpt-4',
        contextWindow: 4000,
        temperature: 0.6,
        features: [
            'consultation_summary',
            'follow_up_planning',
            'treatment_recommendations'
        ],
        inputFields: [
            'consultation_notes',
            'medical_history',
            'current_concerns',
            'doctor_notes'
        ]
    }
};

// API Keys and Endpoints Configuration
const API_CONFIG = {
    openai: {
        baseUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        models: {
            'gpt-4': {
                maxTokens: 8192,
                costPerToken: 0.03
            },
            'gpt-3.5-turbo': {
                maxTokens: 4096,
                costPerToken: 0.002
            }
        }
    },
    // Add other AI providers here
    anthropic: {
        baseUrl: process.env.ANTHROPIC_API_URL,
        apiKey: process.env.ANTHROPIC_API_KEY
    }
};

// Model Selection Strategy
const MODEL_SELECTION = {
    default: 'gpt-3.5-turbo',
    highAccuracy: 'gpt-4',
    costEffective: 'gpt-3.5-turbo',
    emergency: 'gpt-4'
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
    requestsPerMinute: 60,
    burstLimit: 100,
    cooldownPeriod: 60000 // 1 minute
};

// Error Handling Configuration
const ERROR_HANDLING = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    fallbackStrategies: {
        timeout: 'use_fallback_model',
        rateLimit: 'queue_request',
        apiError: 'retry_with_backoff'
    }
};

// Helper Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Export configurations
export {
    AI_MODEL_TYPES,
    BASE_AI_CONFIG,
    MODEL_CONFIGS,
    API_CONFIG,
    MODEL_SELECTION,
    RATE_LIMIT_CONFIG,
    ERROR_HANDLING,
    BANGLADESH_RISK_FACTORS,
    BANGLADESH_VALIDATION_RULES,
    sleep
}; 