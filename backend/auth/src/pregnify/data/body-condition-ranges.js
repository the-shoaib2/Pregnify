/**
 * Body condition ranges for different demographics
 * Used for risk assessment and health monitoring
 */

export const bodyConditionRanges = {
  "BodyConditionRanges": {
    "Men": {
      "BMI": "18.5–24.9",
      "Weight": "Varies with height; healthy BMI range applies",
      "BloodPressure": "Normal: 120/80 mmHg",
      "FastingBloodSugar": "70–99 mg/dL",
      "Hemoglobin": "≥13 g/dL",
      "TSH": "0.4–4.0 mIU/L",
      "Nutrition": "Balanced diet, adequate protein & micronutrients"
    },
    "Women": {
      "BMI": "18.5–22.9 (South Asian ideal); pregnancy weight gain varies by BMI",
      "Weight": "5–18 kg depending on starting BMI (Pregnancy gain)",
      "BloodPressure": "Normal: 90/60–120/80 mmHg; during pregnancy ≤140/90 mmHg",
      "FastingBloodSugar": "≤95 mg/dL during pregnancy",
      "Hemoglobin": "≥12 g/dL (non-pregnant); ≥11 g/dL (pregnancy); ≥12 g/dL (postpartum)",
      "TSH": "1st trimester: 0.1–2.5, 2nd trimester: 0.2–3.0, Postpartum: normal within 6 months",
      "Nutrition": "Iron, folic acid, calcium-rich foods; prenatal & postnatal supplements"
    },
    "Children": {
      "BMI": "Age- and gender-specific percentiles (growth chart)",
      "Weight": "Tracked by growth curves and Z-scores",
      "BloodPressure": "Normal: ~90/60 mmHg (varies by age)",
      "FastingBloodSugar": "~70–100 mg/dL",
      "Hemoglobin": "11–13 g/dL (varies by age)",
      "TSH": "0.7–6.4 mIU/L (infants); narrows with age",
      "Nutrition": "Breastfeeding or formula, then nutrient-dense solids"
    }
  }
};

/**
 * Helper function to check if a value is within a range
 * @param {number} value - The value to check
 * @param {string} range - The range string (e.g., "18.5–24.9")
 * @returns {boolean} - Whether the value is within the range
 */
export function isWithinRange(value, range) {
  if (!range || !value) return false;
  
  // Parse the range string
  const [minStr, maxStr] = range.split(/[–-]/);
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);
  
  return value >= min && value <= max;
}

/**
 * Helper function to get the appropriate range for a demographic
 * @param {string} demographic - The demographic (Men, Women, Children)
 * @param {string} metric - The metric to get the range for
 * @returns {string} - The range string
 */
export function getRangeForDemographic(demographic, metric) {
  if (!bodyConditionRanges.BodyConditionRanges[demographic]) {
    return null;
  }
  
  return bodyConditionRanges.BodyConditionRanges[demographic][metric];
}

/**
 * Helper function to check if a value is within the appropriate range for a demographic
 * @param {number} value - The value to check
 * @param {string} demographic - The demographic (Men, Women, Children)
 * @param {string} metric - The metric to check
 * @returns {boolean} - Whether the value is within the appropriate range
 */
export function isValueInAppropriateRange(value, demographic, metric) {
  const range = getRangeForDemographic(demographic, metric);
  return isWithinRange(value, range);
}

export default bodyConditionRanges; 