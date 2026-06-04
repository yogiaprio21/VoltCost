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
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Material: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit'] },
          unit: { type: 'string' },
          pricePerUnit: { type: 'number' },
          specification: { type: 'string', nullable: true },
          brand: { type: 'string', nullable: true },
          sourceName: { type: 'string', nullable: true },
          sourceUrl: { type: 'string', nullable: true },
          sourceType: { type: 'string', enum: ['admin', 'vendor', 'market_survey', 'seed'] },
          priceUpdatedAt: { type: 'string', format: 'date-time', nullable: true },
          standardRef: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true }
        }
      },
      CreateMaterialInput: {
        type: 'object',
        required: ['name', 'type', 'unit', 'pricePerUnit'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit'] },
          unit: { type: 'string' },
          pricePerUnit: { type: 'number' },
          specification: { type: 'string', nullable: true },
          brand: { type: 'string', nullable: true },
          sourceName: { type: 'string', nullable: true },
          sourceUrl: { type: 'string', nullable: true },
          sourceType: { type: 'string', enum: ['admin', 'vendor', 'market_survey', 'seed'] },
          priceUpdatedAt: { type: 'string', format: 'date-time', nullable: true },
          standardRef: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true }
        }
      },
      MaterialCatalogResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Material' } },
          meta: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              disclaimer: { type: 'string' },
              standardNote: { type: 'string' }
            }
          }
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
        security: [{ BearerAuth: [] }],
        summary: 'Get all materials',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Material' } } } } } }
      },
      post: {
        security: [{ BearerAuth: [] }],
        summary: 'Create material',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialInput' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Material' } } } } }
      }
    },
    '/materials/catalog': {
      get: {
        summary: 'Get public material price catalog',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/MaterialCatalogResponse' } } } } }
      }
    },
    '/materials/{id}': {
      put: {
        security: [{ BearerAuth: [] }],
        summary: 'Update material',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialInput' } } } },
        responses: { '200': { description: 'OK' } }
      },
      delete: {
        security: [{ BearerAuth: [] }],
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
        security: [{ BearerAuth: [] }],
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
