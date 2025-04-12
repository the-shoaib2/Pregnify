const passwordResetCodeTemplate = (name, code) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
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
        .preview-text {
            display: none;
            max-height: 0px;
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background: #007bff;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .code-box {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
            border-radius: 4px;
            border: 2px dashed #007bff;
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
    <div class="preview-text">
        Your verification code: ${code} (expires in 1 minute)
    </div>
    <div class="container">
        <div class="header">
            <h1>Password Reset Code</h1>
        </div>
        <div class="content">
            <h2>Hi ${name}!</h2>
            <div class="code-box">
                ${code}
            </div>
            <p>You requested a password reset code. Use the following code to reset your password:</p>
            <div class="warning">
                <p>⚠️ This code will expire in 1 minute.</p>
                <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export default passwordResetCodeTemplate; 