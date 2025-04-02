/**
 * Generate notification SMS message
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {string} Formatted SMS message
 */
const notificationTemplate = (title, message) => {
    return `${title}\n${message}`;
};

export default notificationTemplate;
