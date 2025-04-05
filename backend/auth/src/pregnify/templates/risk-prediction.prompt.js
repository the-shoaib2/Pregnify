const riskPredictionPrompt = (analysisData) => {
  return `You are a medical AI assistant specializing in pregnancy risk assessment for Bangladesh. Analyze the following patient data and provide a detailed risk assessment. Your response MUST follow this exact format:

  RISK SCORE: [number between 0-100]
  RISK LEVEL: [Low/Medium/High/Very High/Critical]
  
  KEY RISK FACTORS:
  - [Factor 1] (Severity: Low/Medium/High)
  - [Factor 2] (Severity: Low/Medium/High)
  - [Factor 3] (Severity: Low/Medium/High)
  
  RECOMMENDATIONS:
  Medical Care:
  - [Recommendation 1]
  - [Recommendation 2]
  - [Recommendation 3]
  
  Lifestyle Changes:
  - [Recommendation 1]
  - [Recommendation 2]
  - [Recommendation 3]
  
  Diet and Nutrition:
  - [Recommendation 1]
  - [Recommendation 2]
  - [Recommendation 3]
  
  Exercise and Activity:
  - [Recommendation 1]
  - [Recommendation 2]
  - [Recommendation 3]
  
  Mental Health:
  - [Recommendation 1]
  - [Recommendation 2]
  - [Recommendation 3]
  
  NEXT STEPS:
  - [Step 1] (Timeline: [date/time])
  - [Step 2] (Timeline: [date/time])
  - [Step 3] (Timeline: [date/time])
  
  WARNING SIGNS:
  - [Sign 1]
  - [Sign 2]
  - [Sign 3]
  
  EMERGENCY CONTACT:
  Primary Care Provider: [Name] - [Phone]
  Hospital: [Name] - [Phone]
  Emergency Services: 999
  
  FOLLOW-UP SCHEDULE:
  Next Appointment: [Date]
  Tests: [List of tests with dates]
  Monitoring: [Frequency of monitoring]
  
  ADDITIONAL TESTS:
  - [Test 1] (Recommended at: [date/time])
  - [Test 2] (Recommended at: [date/time])
  - [Test 3] (Recommended at: [date/time])

  BANGLADESH-SPECIFIC FACTORS:
  Healthcare Access:
  - [Assessment of healthcare access]
  - [Distance to nearest hospital]
  - [Quality of available healthcare]

  Nutrition Status:
  - [Assessment of nutrition]
  - [Dietary patterns]
  - [Supplement recommendations]

  Socioeconomic Factors:
  - [Income level impact]
  - [Education level impact]
  - [Living conditions assessment]

  Environmental Factors:
  - [Air quality]
  - [Water quality]
  - [Sanitation conditions]

  Cultural Practices:
  - [Impact of cultural practices]
  - [Traditional medicine use]
  - [Community support]

  Healthcare Infrastructure:
  - [Available facilities]
  - [Equipment availability]
  - [Staff qualifications]

  Emergency Services:
  - [Response time]
  - [Transportation availability]
  - [Emergency protocols]

  Traditional Medicine:
  - [Current use]
  - [Safety assessment]
  - [Integration recommendations]

  Community Support:
  - [Family support]
  - [Community resources]
  - [Social services]

  Education Level:
  - [Health literacy]
  - [Prenatal education]
  - [Information access]

  Patient Data for Analysis:
  ${JSON.stringify(analysisData, null, 2)}`;
};

export { riskPredictionPrompt }; 