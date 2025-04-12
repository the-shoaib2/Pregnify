import { createTemplate } from './utils/template-utils.js';

const loginNotificationTemplate = (user, loginDetails) => createTemplate(`
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
                background: #2ecc71;
                color: white;
                border-radius: 8px 8px 0 0;
            }
            .header-info {
                background: #3498db;
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
            .card-header {
                background: #f1f1f1;
                padding: 10px;
                border-radius: 4px 4px 0 0;
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
            .danger-box {
                background: #fff3cd;
                color: #856404;
                padding: 10px;
                border-radius: 4px;
                margin: 15px 0;
            }
            .info-box {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                margin: 15px 0;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background: #e74c3c;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
            }
            .button-danger {
                background: #e74c3c;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 0.8em;
            }
            .footer-links {
                margin: 10px 0;
            }
            .footer-link {
                color: #337ab7;
                text-decoration: none;
                margin: 0 10px;
            }
            .text-muted {
                color: #999;
            }
            .text-primary {
                color: #337ab7;
            }
            .text-center {
                text-align: center;
            }
            .mt-10 {
                margin-top: 10px;
            }
            .mt-20 {
                margin-top: 20px;
            }
            .mb-0 {
                margin-bottom: 0;
            }
            .mb-10 {
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header header-info">
                <h1>New Login Detected</h1>
            </div>
            <div class="content">
                <h2>Hello ${user.name},</h2>

                <p>We detected a new login to your account with the following details:</p>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-primary mb-0">Login Details</h3>
                    </div>
                    <table class="data-grid">
                        <tr>
                            <th>Time</th>
                            <td>${loginDetails.time}</td>
                        </tr>
                        <tr>
                            <th>Device</th>
                            <td>${loginDetails.device}</td>
                        </tr>
                        <tr>
                            <th>Location</th>
                            <td>${loginDetails.location}</td>
                        </tr>
                        <tr>
                            <th>IP Address</th>
                            <td>${loginDetails.ip}</td>
                        </tr>
                    </table>
                </div>

                <div class="danger-box mt-20">
                    <h3 class="mb-10">Wasn't you?</h3>
                    <p>If you don't recognize this login activity, your account might be compromised. Take immediate action:</p>
                    <div class="text-center mt-20">
                        <a href="${loginDetails.securityLink}" class="button button-danger">Secure My Account</a>
                    </div>
                </div>

                <div class="info-box mt-20">
                    <p>For your security, we recommend:</p>
                    <ul>
                        <li>Enable two-factor authentication</li>
                        <li>Use a strong, unique password</li>
                        <li>Regularly review your account activity</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated security notification.</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Security Settings</a>
                    <a href="#" class="footer-link">Help Center</a>
                    <a href="#" class="footer-link">Contact Support</a>
                </div>
                <p class="text-muted">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`);

export default loginNotificationTemplate;
