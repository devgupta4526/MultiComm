// swagger.js — CommonJS version

const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
  info: {
    title: 'Auth Service API',
    description: 'Automatically generated Swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';

// Use absolute path so it works regardless of where you run it
const endpointsFiles = [
  path.join(__dirname, 'routes', 'auth.routes.ts') // adjust if in "app/routes"
];

swaggerAutogen(outputFile, endpointsFiles, doc);
