export const testAIModel = {
  async getResponse(message) {
    // Simple response generation logic
    const responses = [
      "I understand your concern. Let me help you with that.",
      "That's an interesting question. Here's what I think...",
      "Based on your input, I would suggest...",
      "I'm here to assist you with your pregnancy-related queries.",
      "Let me analyze that for you..."
    ];

    // Get a random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    const baseResponse = responses[randomIndex];

    // Add some context awareness
    if (message.toLowerCase().includes('pregnancy')) {
      return `${baseResponse} This is related to pregnancy care.`;
    } else if (message.toLowerCase().includes('risk')) {
      return `${baseResponse} I can help assess your pregnancy risks.`;
    } else if (message.toLowerCase().includes('symptom')) {
      return `${baseResponse} Let's discuss your symptoms in detail.`;
    }

    return baseResponse;
  }
}; 