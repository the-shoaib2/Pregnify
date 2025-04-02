const passwordChangeNotificationTemplate = (name) => `
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
            background: #28a745;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .alert {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
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
            <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <div class="alert">
                <p>Your password has been successfully changed.</p>
            </div>
            <div class="warning">
                <p>If you did not make this change, please:</p>
                <ol>
                    <li>Contact our support team immediately</li>
                    <li>Review your recent account activity</li>
                    <li>Consider enabling two-factor authentication</li>
                </ol>
            </div>
        </div>
        <div class="footer">
            <p>This is a security notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export default passwordChangeNotificationTemplate; 