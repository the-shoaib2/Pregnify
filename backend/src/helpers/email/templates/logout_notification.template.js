import { createTemplate } from './utils/template-utils.js';

const logoutNotificationTemplate = (name, logoutDetails) => createTemplate(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                background: #3498db;
                color: white;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 20px;
                color: #333;
            }
            .card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
            }
            .data-grid {
                width: 100%;
                border-collapse: collapse;
            }
            .data-grid th, .data-grid td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
            }
            .data-grid th {
                background: #f1f1f1;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 0.8em;
            }
            .text-muted {
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Logout Notification</h1>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Your account was successfully logged out with the following details:</p>
                
                <div class="card">
                    <table class="data-grid">
                        <tr>
                            <th>Time</th>
                            <td>${logoutDetails.time}</td>
                        </tr>
                        <tr>
                            <th>Device</th>
                            <td>${logoutDetails.device}</td>
                        </tr>
                        <tr>
                            <th>Location</th>
                            <td>${logoutDetails.location || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <th>Session Duration</th>
                            <td>${logoutDetails.sessionDuration || 'N/A'}</td>
                        </tr>
                    </table>
                </div>

                <p>If you didn't perform this logout, please secure your account immediately:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${logoutDetails.securityLink}" 
                       style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                        Secure My Account
                    </a>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated security notification.</p>
                <p class="text-muted">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`);

export default logoutNotificationTemplate;
