const accountRecoveryTemplate = (name, recoveryDetails) => `
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
            background: #9b59b6;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .recovery-steps {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #9b59b6;
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
            <h1>Account Recovery</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to recover your account. Follow these steps to regain access:</p>
            
            <div class="recovery-steps">
                <h3>Recovery Steps:</h3>
                <ol>
                    <li>Click the recovery link below</li>
                    <li>Verify your identity using the provided code: <strong>${recoveryDetails.verificationCode}</strong></li>
                    <li>Create a new password</li>
                    <li>Review and update your security settings</li>
                </ol>
            </div>

            <center>
                <a href="${recoveryDetails.recoveryLink}" class="button">Recover Account</a>
            </center>

            <div class="warning">
                <p>⚠️ This recovery link will expire in ${recoveryDetails.expiryTime}.</p>
                <p>If you didn't request account recovery, please ignore this email and secure your account immediately.</p>
            </div>
        </div>
        <div class="footer">
            <p>Need help? Contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export default accountRecoveryTemplate;
