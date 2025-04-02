const passwordResetTemplate = (name, resetLink) => `
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
            background: #e74c3c;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            color: #333;
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
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <center>
                <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            <div class="warning">
                <p>⚠️ This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export default passwordResetTemplate;
