import ApiResponse from '../../utils/error/api.response.js';
import { testAIModel } from '../models/test-ai.model.js';

export const testController = {
  async helloMessage(req, res) {
    try {
      return res.status(200).json(
        new ApiResponse(200, {
          message: "Hello from Pregnify!",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          status: "active"
        }, "Test endpoint working successfully")
      );
    } catch (error) {
      return res.status(500).json(
        new ApiResponse(500, null, error.message)
      );
    }
  },

  async aiResponse(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json(
          new ApiResponse(400, null, "Message is required")
        );
      }

      // Get AI response
      const aiResponse = await testAIModel.getResponse(message);

      return res.status(200).json(
        new ApiResponse(200, {
          userMessage: message,
          aiResponse: aiResponse,
          timestamp: new Date().toISOString()
        }, "AI response generated successfully")
      );
    } catch (error) {
      return res.status(500).json(
        new ApiResponse(500, null, error.message)
      );
    }
  }
}; 