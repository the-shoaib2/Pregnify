export const parseAIResponse = (aiResponse) => {
  // Extract risk score with flexible patterns
  const riskScoreMatch = aiResponse.match(/RISK SCORE:\s*(\d+)/i) || 
                        aiResponse.match(/Risk Score:\s*(\d+)/i) ||
                        aiResponse.match(/Score:\s*(\d+)/i) ||
                        aiResponse.match(/\b([0-9]|[1-9][0-9]|100)\b/);
  
  // Extract risk level with flexible patterns
  const riskLevelMatch = aiResponse.match(/RISK LEVEL:\s*(Low|Medium|High|Very High|Critical)/i) || 
                        aiResponse.match(/Risk Level:\s*(Low|Medium|High|Very High|Critical)/i) ||
                        aiResponse.match(/Level:\s*(Low|Medium|High|Very High|Critical)/i) ||
                        aiResponse.match(/\b(Low|Medium|High|Very High|Critical)\b/i);

  // Extract other sections with flexible patterns
  const riskFactorsMatch = aiResponse.match(/KEY RISK FACTORS:([\s\S]*?)(?=RECOMMENDATIONS|$)/i) ||
                          aiResponse.match(/Risk Factors:([\s\S]*?)(?=Recommendations|$)/i) ||
                          aiResponse.match(/Factors:([\s\S]*?)(?=Recommendations|$)/i);
  
  const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:([\s\S]*?)(?=NEXT STEPS|$)/i) ||
                             aiResponse.match(/Recommendations:([\s\S]*?)(?=Next Steps|$)/i) ||
                             aiResponse.match(/Advice:([\s\S]*?)(?=Next Steps|$)/i);
  
  const nextStepsMatch = aiResponse.match(/NEXT STEPS:([\s\S]*?)(?=WARNING SIGNS|$)/i) ||
                        aiResponse.match(/Next Steps:([\s\S]*?)(?=Warning Signs|$)/i) ||
                        aiResponse.match(/Actions:([\s\S]*?)(?=Warning Signs|$)/i);
  
  const warningSignsMatch = aiResponse.match(/WARNING SIGNS:([\s\S]*?)(?=EMERGENCY CONTACT|$)/i) ||
                          aiResponse.match(/Warning Signs:([\s\S]*?)(?=Emergency Contact|$)/i) ||
                          aiResponse.match(/Alerts:([\s\S]*?)(?=Emergency Contact|$)/i);

  const emergencyContactMatch = aiResponse.match(/EMERGENCY CONTACT:([\s\S]*?)(?=FOLLOW-UP SCHEDULE|$)/i) ||
                              aiResponse.match(/Emergency Contact:([\s\S]*?)(?=Follow-up Schedule|$)/i) ||
                              aiResponse.match(/Emergency:([\s\S]*?)(?=Follow-up Schedule|$)/i);

  const followUpScheduleMatch = aiResponse.match(/FOLLOW-UP SCHEDULE:([\s\S]*?)(?=ADDITIONAL TESTS|$)/i) ||
                              aiResponse.match(/Follow-up Schedule:([\s\S]*?)(?=Additional Tests|$)/i) ||
                              aiResponse.match(/Schedule:([\s\S]*?)(?=Additional Tests|$)/i);

  const additionalTestsMatch = aiResponse.match(/ADDITIONAL TESTS:([\s\S]*?)(?=BANGLADESH-SPECIFIC FACTORS|$)/i) ||
                             aiResponse.match(/Additional Tests:([\s\S]*?)(?=Bangladesh-specific Factors|$)/i) ||
                             aiResponse.match(/Tests:([\s\S]*?)(?=Bangladesh-specific Factors|$)/i);

  const bangladeshFactorsMatch = aiResponse.match(/BANGLADESH-SPECIFIC FACTORS:([\s\S]*?)$/i) ||
                                aiResponse.match(/Bangladesh-specific Factors:([\s\S]*?)$/i) ||
                                aiResponse.match(/Bangladesh:([\s\S]*?)$/i);

  // Parse the extracted sections
  const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 0;
  const riskLevel = riskLevelMatch ? riskLevelMatch[1] : 'Unknown';
  
  const riskFactors = riskFactorsMatch ? riskFactorsMatch[1].trim() : 'No risk factors identified';
  const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : 'No recommendations available';
  const nextSteps = nextStepsMatch ? nextStepsMatch[1].trim() : 'No next steps provided';
  const warningSigns = warningSignsMatch ? warningSignsMatch[1].trim() : 'No warning signs provided';
  const emergencyContact = emergencyContactMatch ? emergencyContactMatch[1].trim() : 'No emergency contact information provided';
  const followUpSchedule = followUpScheduleMatch ? followUpScheduleMatch[1].trim() : 'No follow-up schedule provided';
  const additionalTests = additionalTestsMatch ? additionalTestsMatch[1].trim() : 'No additional tests recommended';
  const bangladeshFactors = bangladeshFactorsMatch ? bangladeshFactorsMatch[1].trim() : 'No Bangladesh-specific factors identified';

  return {
    riskScore,
    riskLevel,
    riskFactors,
    recommendations,
    nextSteps,
    warningSigns,
    emergencyContact,
    followUpSchedule,
    additionalTests,
    bangladeshFactors
  };
}; 