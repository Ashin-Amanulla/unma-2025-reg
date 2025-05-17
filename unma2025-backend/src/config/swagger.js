import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from '../utils/logger.js';

/**
 * Swagger configuration options
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UNMA 2025 Registration API',
            version: '1.0.0',
            description: 'API documentation for UNMA 2025 Registration platform',
            contact: {
                name: 'API Support',
                email: 'support@unma2025.org'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
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
    apis: ['./src/swagger/*.js']
};

/**
 * Swagger specification
 */
const swaggerSpec = swaggerJsDoc(swaggerOptions);

/**
 * Setup Swagger documentation routes
 * @param {Object} app - Express application instance
 */
export const setupSwagger = (app) => {
    // Serve Swagger documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve Swagger JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    logger.info('Swagger documentation setup complete');
}; 