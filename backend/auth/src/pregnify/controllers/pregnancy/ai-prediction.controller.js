import prisma from '../../../utils/database/prisma.js';
import { riskPredictionPrompt } from '../../templates/risk-prediction.prompt.js';
import fetch from 'node-fetch';

// Create a class to maintain proper 'this' context
class AiPredictionController {
  async getPrediction(req, res) {
    try {
      const { type, category, subCategory } = req.query;
      const { pregnancyId } = req.params;
      const userId = req.user.id;

      console.log('Starting AI prediction:', { type, category, subCategory, pregnancyId });

      // Get the latest assessment data if it's a pregnancy-related prediction
      let latestAssessment = null;
      let pregnancy = null;

      if (type === 'PREGNANCY') {
        latestAssessment = await prisma.riskAssessment.findFirst({
          where: {
            pregnancyId,
            userId,
          },
          orderBy: {
            assessmentDate: 'desc',
          },
        });

        if (!latestAssessment) {
          return res.status(404).json({
            success: false,
            message: 'No risk assessment found for this pregnancy',
          });
        }

        pregnancy = await prisma.pregnancyProfile.findUnique({
          where: {
            id: pregnancyId,
          },
        });

        if (!pregnancy) {
          return res.status(404).json({
            success: false,
            message: 'Pregnancy profile not found',
          });
        }
      }

      // Get previous predictions for trend analysis
      const previousPredictions = await prisma.aiPredictionResponse.findMany({
        where: {
          userId,
          pregnancyId: type === 'PREGNANCY' ? pregnancyId : undefined,
          type,
          category,
          subCategory,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      });

      // Prepare the prompt based on type and category
      let prompt;
      if (type === 'PREGNANCY') {
        // Check if we have the necessary data for pregnancy risk prediction
        if (!latestAssessment || !pregnancy) {
          return res.status(400).json({
            success: false,
            message: 'Missing required data for pregnancy risk prediction. Please ensure you have completed a risk assessment and have a valid pregnancy profile.',
          });
        }
        
        prompt = riskPredictionPrompt({
          assessment: latestAssessment,
          pregnancy,
          previousPredictions,
        });
      } else {
        // Add other prompt templates for different types
        prompt = this.getPromptForType(type, category, {
          userId,
          previousPredictions,
          assessment: latestAssessment || {},
          pregnancy: pregnancy || {},
        });
      }

      console.log('Generated prompt:', prompt);

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Make API call
      const response = await fetch(process.env.OPENAI_API_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': process.env.APP_NAME || 'Pregnify',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get AI prediction');
      }

      // Handle the streaming response
      let buffer = '';
      let completeResponse = '';

      response.body.on('data', (chunk) => {
        buffer += chunk.toString();
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              this.savePredictionToDatabase({
                type,
                category,
                subCategory,
                pregnancyId,
                userId,
                assessmentId: latestAssessment?.id,
                prediction: completeResponse,
              });
              
              console.log('AI Prediction Response:', {
                type,
                category,
                subCategory,
                pregnancyId,
                userId,
                completeResponse,
                timestamp: new Date().toISOString(),
              });
              
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                completeResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      });

      response.body.on('end', () => {
        if (buffer) {
          try {
            const data = buffer.slice(6);
            if (data !== '[DONE]') {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                completeResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            }
          } catch (e) {
            console.error('Error parsing final chunk:', e);
          }
        }

        this.savePredictionToDatabase({
          type,
          category,
          subCategory,
          pregnancyId,
          userId,
          assessmentId: latestAssessment?.id,
          prediction: completeResponse,
        });

        console.log('AI Prediction Response:', {
          type,
          category,
          subCategory,
          pregnancyId,
          userId,
          completeResponse,
          timestamp: new Date().toISOString(),
        });

        res.write('data: [DONE]\n\n');
        res.end();
      });

      response.body.on('error', (error) => {
        console.error('Stream error:', error);
        res.status(500).json({
          success: false,
          message: 'Error streaming AI prediction',
          error: error.message,
        });
      });

    } catch (error) {
      console.error('Error in AI prediction:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: 'Error generating AI prediction',
        error: error.message,
      });
    }
  }

  getPromptForType(type, category, data) {
    // Add prompts for different types and categories
    switch (type) {
      case 'HEALTH':
        return this.getHealthPrompt(category, data);
      case 'SECURITY':
        return this.getSecurityPrompt(category, data);
      case 'NUTRITION':
        return this.getNutritionPrompt(category, data);
      // Add more cases as needed
      default:
        // Default to pregnancy risk prediction if type is undefined
        // Check if we have the necessary data for pregnancy risk prediction
        if (!data.assessment || !data.pregnancy) {
          return `You are "Pregnify AI" — an advanced medical assistant specializing in pregnancy risk prediction for Bangladesh.
          
          ## CONTEXT & INSTRUCTIONS:
          1. Focus on Bangladesh-specific healthcare context
          2. Consider local resources and limitations
          3. Provide detailed, step-by-step recommendations
          4. Include both immediate and long-term actions
          5. Format all responses in JSON structure for frontend consumption
          
          ## NOTE:
          The patient data is incomplete. Please provide general pregnancy advice and recommendations.
          
          ## PATIENT DATA FOR ANALYSIS:
          ${JSON.stringify(data, null, 2)}`;
        }
        
        return riskPredictionPrompt({
          assessment: data.assessment,
          pregnancy: data.pregnancy,
          previousPredictions: data.previousPredictions,
        });
    }
  }

  getHealthPrompt(category, data) {
    // Implement health-specific prompt
    return `You are "Pregnify AI" — an advanced medical assistant specializing in health predictions for pregnancy.
    
    ## CONTEXT & INSTRUCTIONS:
    1. Focus on health-related aspects of pregnancy
    2. Provide detailed, step-by-step recommendations
    3. Format all responses in JSON structure for frontend consumption
    
    ## PATIENT DATA FOR ANALYSIS:
    ${JSON.stringify(data, null, 2)}`;
  }

  getSecurityPrompt(category, data) {
    // Implement security-specific prompt
    return `You are "Pregnify AI" — an advanced medical assistant specializing in security predictions for pregnancy.
    
    ## CONTEXT & INSTRUCTIONS:
    1. Focus on security-related aspects of pregnancy
    2. Provide detailed, step-by-step recommendations
    3. Format all responses in JSON structure for frontend consumption
    
    ## PATIENT DATA FOR ANALYSIS:
    ${JSON.stringify(data, null, 2)}`;
  }

  getNutritionPrompt(category, data) {
    // Implement nutrition-specific prompt
    return `You are "Pregnify AI" — an advanced medical assistant specializing in nutrition predictions for pregnancy.
    
    ## CONTEXT & INSTRUCTIONS:
    1. Focus on nutrition-related aspects of pregnancy
    2. Provide detailed, step-by-step recommendations
    3. Format all responses in JSON structure for frontend consumption
    
    ## PATIENT DATA FOR ANALYSIS:
    ${JSON.stringify(data, null, 2)}`;
  }

  async savePredictionToDatabase({
    type,
    category,
    subCategory,
    pregnancyId,
    userId,
    assessmentId,
    prediction,
  }) {
    try {
      // Parse the prediction data
      let predictionData;
      try {
        predictionData = JSON.parse(prediction);
      } catch (error) {
        console.error('Error parsing prediction data:', error);
        // Create a simple prediction data structure if parsing fails
        predictionData = {
          summary: 'AI prediction generated',
          riskAssessment: {
            overallRisk: {
              score: 50,
              level: 'Moderate',
              trend: 'Stable',
            },
          },
        };
      }
      
      // Save to database
      await prisma.aiPredictionResponse.create({
        data: {
          type: type || 'PREGNANCY', // Default to PREGNANCY if type is undefined
          category: category || 'RISK_ASSESSMENT', // Default to RISK_ASSESSMENT if category is undefined
          subCategory,
          pregnancyId,
          userId,
          assessmentId,
          data: predictionData,
          summary: predictionData.summary || null,
          priority: predictionData.priority || null,
          status: 'Active',
          
          // Risk assessment data (if applicable)
          riskScore: predictionData.riskAssessment?.overallRisk?.score || null,
          riskLevel: predictionData.riskAssessment?.overallRisk?.level || null,
          riskTrend: predictionData.riskAssessment?.overallRisk?.trend || null,
          previousScore: predictionData.riskAssessment?.overallRisk?.previousScore || null,
          scoreChange: predictionData.riskAssessment?.overallRisk?.change || null,
          
          // Risk factors (if applicable)
          medicalRisks: predictionData.riskAssessment?.riskFactors?.medical || null,
          lifestyleRisks: predictionData.riskAssessment?.riskFactors?.lifestyle || null,
          environmentalRisks: predictionData.riskAssessment?.riskFactors?.environmental || null,
          
          // Recommendations (if applicable)
          recommendations: predictionData.recommendations || null,
          
          // Warnings (if applicable)
          warnings: predictionData.warningSystem || null,
          
          // Location data (if applicable)
          locationData: predictionData.bangladeshSpecific || null,
          
          // Follow up (if applicable)
          followUp: predictionData.followUpSchedule || null,
          
          // Metadata
          metadata: {
            timestamp: new Date().toISOString(),
            model: process.env.OPENAI_MODEL,
            version: '1.0',
          },
        },
      });

      console.log('AI prediction saved to database successfully');
    } catch (error) {
      console.error('Error saving AI prediction to database:', error);
    }
  }
}

// Create an instance of the controller
const aiPredictionController = new AiPredictionController();

export { aiPredictionController };