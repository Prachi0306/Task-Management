const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description: 'Production-grade REST API for Task Management',
      contact: {
        name: 'API Support',
        url: 'http://localhost:5000',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: `${config.env} server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // Files containing Swagger annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
