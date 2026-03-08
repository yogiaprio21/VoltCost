const swaggerUi = require('swagger-ui-express');

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Electrical Installation Cost Estimator API',
    version: '1.0.0'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      AdminApiKey: { type: 'apiKey', in: 'header', name: 'X-Admin-Key' }
    },
    schemas: {
      Material: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit'] },
          unit: { type: 'string' },
          pricePerUnit: { type: 'number' }
        }
      },
      CreateMaterialInput: {
        type: 'object',
        required: ['name', 'type', 'unit', 'pricePerUnit'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit'] },
          unit: { type: 'string' },
          pricePerUnit: { type: 'number' }
        }
      },
      EstimateInput: {
        type: 'object',
        required: ['houseArea','lampPoints','socketPoints','acCount','pumpCount','powerCapacity','installationType'],
        properties: {
          houseArea: { type: 'number' },
          lampPoints: { type: 'number' },
          socketPoints: { type: 'number' },
          acCount: { type: 'number' },
          pumpCount: { type: 'number' },
          powerCapacity: { type: 'number', enum: [900,1300,2200,3500] },
          installationType: { type: 'string', enum: ['standard','premium'] }
        }
      },
      EstimateResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          totalCost: { type: 'number' },
          breakdown: { type: 'object' }
        }
      },
      AnalyticsResponse: {
        type: 'object',
        properties: {
          totalEstimations: { type: 'integer' },
          averageCost: { type: 'number' },
          mostCommonPowerCapacity: { type: 'integer' },
          monthlyTrends: {
            type: 'array',
            items: {
              type: 'object',
              properties: { month: { type: 'string' }, count: { type: 'integer' }, averageCost: { type: 'number' } }
            }
          }
        }
      }
    }
  },
  paths: {
    '/materials': {
      get: {
        security: [{ AdminApiKey: [] }],
        summary: 'Get all materials',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Material' } } } } } }
      },
      post: {
        security: [{ AdminApiKey: [] }],
        summary: 'Create material',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialInput' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Material' } } } } }
      }
    },
    '/materials/{id}': {
      put: {
        security: [{ AdminApiKey: [] }],
        summary: 'Update material',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialInput' } } } },
        responses: { '200': { description: 'OK' } }
      },
      delete: {
        security: [{ AdminApiKey: [] }],
        summary: 'Delete material',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '204': { description: 'No Content' } }
      }
    },
    '/estimate': {
      post: {
        summary: 'Create estimation',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EstimateInput' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/EstimateResponse' } } } } }
      }
    },
    '/estimate/{id}/pdf': {
      get: {
        summary: 'Download estimation PDF',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'PDF' } }
      }
    },
    '/analytics': {
      get: {
        summary: 'Dashboard analytics',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyticsResponse' } } } } }
      }
    }
  }
};

module.exports = {
  ui: swaggerUi.serve,
  handler: swaggerUi.setup(openapi),
  spec: openapi
};
