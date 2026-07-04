import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlavorDash Luxury Ordering API',
      version: '1.0.0',
      description: 'Enterprise API documentation for FlavorDash, a luxury single-restaurant ordering system. Features secure JWT/Google authentication, real-time driver tracking, AI meal planner integration, and admin reporting.',
      contact: {
        name: 'FlavorDash Support',
        email: 'support@flavordash.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'deliveryPartner', 'admin'] },
            avatar: { type: 'string' }
          }
        },
        Restaurant: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            cuisines: { type: 'array', items: { type: 'string' } },
            address: { type: 'string' },
            openingHours: { type: 'string' },
            rating: { type: 'number' }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            isAvailable: { type: 'boolean' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            items: { type: 'array', items: { type: 'object' } },
            subtotal: { type: 'number' },
            deliveryFee: { type: 'number' },
            tax: { type: 'number' },
            grandTotal: { type: 'number' },
            status: { type: 'string' },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
