import express from 'express';
import routeDocumentation from '../../../docs/routes.documentation.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Documentation',
        data: routeDocumentation
    });
});

router.get('/postman', (req, res) => {
    // Convert documentation to Postman collection format
    const postmanCollection = {
        info: {
            name: 'API Documentation',
            description: 'Complete API documentation',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: Object.entries(routeDocumentation).map(([group, groupData]) => ({
            name: group,
            item: Object.entries(groupData.routes).map(([name, route]) => ({
                name,
                request: {
                    method: route.method,
                    url: {
                        raw: `{{baseUrl}}${groupData.prefix}${route.path}`,
                        host: ['{{baseUrl}}'],
                        path: [groupData.prefix.slice(1), ...route.path.slice(1).split('/')]
                    },
                    description: route.description,
                    auth: route.requiresAuth ? {
                        type: 'bearer',
                        bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }]
                    } : undefined
                }
            }))
        }))
    };

    res.json(postmanCollection);
});

export default router; 