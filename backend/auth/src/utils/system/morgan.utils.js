import morgan from 'morgan';

// Color codes with specific HEX approximations
const colors = {
    reset: '\x1b[0m',
    
    // Method colors
    methodGet: '\x1b[32m',     // Green (#00FF00)
    methodPost: '\x1b[38;5;208m',  // Orange (#FFA500)
    methodPut: '\x1b[34m',     // Blue (#0000FF)
    methodDelete: '\x1b[31m',  // Red (#FF0000)
    methodPatch: '\x1b[35m',   // Purple (#800080)
    methodHead: '\x1b[36m',    // Cyan (#00FFFF)
    methodOptions: '\x1b[33m', // Yellow (#FFFF00)
    
    // Status code colors
    status2xx: '\x1b[32m',     // Green for 2xx
    status3xx: '\x1b[36m',     // Cyan for 3xx
    status4xx: '\x1b[33m',     // Yellow for 4xx
    status5xx: '\x1b[31m',     // Red for 5xx

    // Response time color
    responseTime: '\x1b[35m'   // Magenta for response time
};

/**
 * Creates a colorized Morgan logging middleware
 * @param {Object} app - Express application instance
 * @returns {Function} Morgan middleware
 */
export const createMorganLogger = (app) => {
    app.use(morgan((tokens, req, res) => {
        // Colorize method
        let methodColor = colors.reset;
        switch (tokens.method(req, res)) {
            case 'GET': methodColor = colors.methodGet; break;
            case 'POST': methodColor = colors.methodPost; break;
            case 'PUT': methodColor = colors.methodPut; break;
            case 'DELETE': methodColor = colors.methodDelete; break;
            case 'PATCH': methodColor = colors.methodPatch; break;
            case 'HEAD': methodColor = colors.methodHead; break;
            case 'OPTIONS': methodColor = colors.methodOptions; break;
        }

        // Colorize status code
        let statusColor = colors.reset;
        const status = parseInt(tokens.status(req, res));
        if (status >= 200 && status < 300) statusColor = colors.status2xx;
        else if (status >= 300 && status < 400) statusColor = colors.status3xx;
        else if (status >= 400 && status < 500) statusColor = colors.status4xx;
        else if (status >= 500) statusColor = colors.status5xx;

        // Calculate response time
        const responseTime = parseFloat(tokens['response-time'](req, res)).toFixed(3);

        // Construct log message with colors
        return `${methodColor}${tokens.method(req, res)}${colors.reset} ${tokens.url(req, res)} ${statusColor}${status}${colors.reset} ${colors.responseTime}${responseTime} ms${colors.reset} - ${tokens.res(req, res, 'content-length') || '-'}`;
    }, {
        immediate: false,
        stream: process.stdout
    }));
};

export default { createMorganLogger };
