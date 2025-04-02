export const newDeviceTwoFactorTemplate = (name, deviceInfo) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { 
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>New Device Added to Trusted List</h2>
        <p>Hello ${name},</p>
        <div class="info">
            <p>A new device has been added to your trusted devices list:</p>
            <ul>
                <li>Device: ${deviceInfo.deviceName}</li>
                <li>Time: ${deviceInfo.timestamp}</li>
                <li>Location: ${deviceInfo.location || 'Unknown'}</li>
            </ul>
        </div>
        <p>This device will now skip 2FA verification for future logins.</p>
        <p>If you don't recognize this device, please:</p>
        <ol>
            <li>Remove it from your trusted devices immediately</li>
            <li>Change your password</li>
            <li>Contact our support team</li>
        </ol>
        <p>Best regards,<br>Your Security Team</p>
    </div>
</body>
</html>
`; 