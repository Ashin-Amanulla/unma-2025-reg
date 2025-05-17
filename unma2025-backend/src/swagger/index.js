import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from '../utils/logger.js';

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UNMA 2025 Registration API',
            version: '1.0.0',
            description: 'API documentation for UNMA 2025 Event Registration System',
            contact: {
                name: 'API Support',
                email: 'support@unma2025.org'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.unma2025.org',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    // Path to the API docs
    apis: [
        './src/swagger/auth.yaml',
        './src/swagger/events.yaml',
        './src/swagger/registrations.yaml',
        './src/swagger/admin.yaml'
    ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Function to setup Swagger
export const setupSwagger = (app) => {
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }'
    }));

    // Serve swagger spec as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    logger.info('Swagger documentation setup complete');
}; 