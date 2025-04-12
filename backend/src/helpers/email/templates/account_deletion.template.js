const accountDeletionTemplate = (name, deletionDetails) => `
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
        .warning-box {
            background: #fee;
            border-left: 4px solid #e74c3c;
            padding: 15px;
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
        .data-info {
            background: #f8f9fa;
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
            <h1>Account Deletion Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to delete your account. This action will:</p>
            
            <div class="warning-box">
                <h3>⚠️ Important Information</h3>
                <ul>
                    <li>Permanently delete all your data</li>
                    <li>Remove access to all services</li>
                    <li>Cancel any active subscriptions</li>
                    <li>This action cannot be undone</li>
                </ul>
            </div>

            <div class="data-info">
                <p><strong>Request Time:</strong> ${deletionDetails.requestTime}</p>
                <p><strong>Account Email:</strong> ${deletionDetails.email}</p>
                <p><strong>Deletion will be processed in:</strong> ${deletionDetails.processingTime}</p>
            </div>

            <p>If you wish to proceed with account deletion, click the button below:</p>
            
            <center>
                <a href="${deletionDetails.confirmationLink}" class="button">Confirm Account Deletion</a>
            </center>

            <p>If you didn't request this deletion, please secure your account immediately by:</p>
            <ol>
                <li>Changing your password</li>
                <li>Enabling two-factor authentication</li>
                <li>Contacting our support team</li>
            </ol>
        </div>
        <div class="footer">
            <p>We're sad to see you go. If you change your mind, you can cancel this request within ${deletionDetails.processingTime}.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export default accountDeletionTemplate;
