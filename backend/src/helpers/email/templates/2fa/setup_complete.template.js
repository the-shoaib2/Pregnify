export const twoFactorSetupCompleteTemplate = (name, method) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { 
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .alert {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Two-Factor Authentication Enabled</h2>
        <p>Hello ${name},</p>
        <div class="alert">
            <p>Two-factor authentication has been successfully set up on your account using ${method}.</p>
        </div>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Security Tips:</p>
        <ul>
            <li>Keep your backup codes in a safe place</li>
            <li>Don't share your 2FA credentials with anyone</li>
            <li>Consider setting up multiple 2FA methods</li>
        </ul>
        <p>Best regards,<br>Your Security Team</p>
    </div>
</body>
</html>
`; 