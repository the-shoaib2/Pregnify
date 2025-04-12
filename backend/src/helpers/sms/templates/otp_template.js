/**
 * Generate OTP SMS message
 * @param {string} otp - One-time password
 * @returns {string} Formatted SMS message
 */
const otpTemplate = (otp) => {
    return `Your verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
};

export default otpTemplate;
