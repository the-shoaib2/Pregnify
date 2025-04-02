import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load CSS styles from file and return as string
 * @returns {string} CSS styles
 */
export const getEmailStyles = () => {
    const cssPath = path.join(__dirname, '../styles/index.css');
    return fs.readFileSync(cssPath, 'utf8');
};

/**
 * Create email template with common styles
 * @param {string} content - HTML content of the email
 * @returns {string} Complete HTML with styles
 */
export const createTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${getEmailStyles()}
    </style>
</head>
<body class="body">
    ${content}
</body>
</html>
`;
