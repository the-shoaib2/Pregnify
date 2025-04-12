import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import express from 'express';

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://tqzqmb4p-8080.inc1.devtunnels.ms/',
        '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Security middleware configuration
const securityMiddleware = [
    // Disable x-powered-by header
    (req, res, next) => {
        res.removeHeader('X-Powered-By');
        next();
    },
    
    // Helmet configuration
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "unsafe-none" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
                fontSrc: ["'self'", "fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "blob:"],
                connectSrc: ["'self'"]
            }
        }
    }),
    
    // Compression
    compression(),
    
    // Body parsers
    express.json({ limit: '10kb' }),
    express.urlencoded({ extended: true, limit: '10kb' }),
    
    // CORS
    cors(corsOptions)
];

export { securityMiddleware };
