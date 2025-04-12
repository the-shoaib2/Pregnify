export const twoFactorDisabledTemplate = (name, timestamp) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { 
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .warning {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Two-Factor Authentication Disabled</h2>
        <p>Hello ${name},</p>
        <div class="warning">
            <p>Two-factor authentication was disabled on your account on ${timestamp}.</p>
        </div>
        <p>If you didn't make this change, please:</p>
        <ol>
            <li>Change your password immediately</li>
            <li>Re-enable two-factor authentication</li>
            <li>Contact our support team</li>
        </ol>
        <p>Best regards,<br>Your Security Team</p>
    </div>
</body>
</html>
`; 