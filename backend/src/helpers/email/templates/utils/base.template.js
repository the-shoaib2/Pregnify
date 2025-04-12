/**
 * Base email template that wraps content with common styling and structure
 * @param {string} content - HTML content to wrap
 * @returns {string} Complete HTML email template
 */
export const baseEmailTemplate = (content) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Notification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table role="presentation" style="max-width: 600px; width: 100%; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                                <td>
                                    ${content}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}; 