const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Fabio Auto Peças API",
    version: "1.0.0",
    description:
      "API para gestão de usuários, categorias, produtos e vendas da loja Fabio Auto Peças.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            example: "Mensagem do erro",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "cliente@teste.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "123456",
          },
        },
      },
      AuthTokenResponse: {
        type: "object",
        required: ["token"],
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@teste.com" },
          password: { type: "string", example: "hashed_password" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserCreateRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@teste.com" },
          password: { type: "string", format: "password", example: "123456" },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Filtros" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryCreateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Filtros" },
        },
      },
      Product: {
        type: "object",
        required: ["id", "name", "ref", "category_id"],
        properties: {
          id: { type: "integer", example: 10 },
          name: { type: "string", example: "Filtro de Óleo" },
          ref: { type: "string", example: "FLT-001" },
          notes: {
            type: "string",
            nullable: true,
            example: "Filtro compatível",
          },
          cost_price: { type: "number", example: 25.5 },
          sale_price: { type: "number", example: 39.9 },
          amount: { type: "integer", example: 50 },
          minimum_amount: { type: "integer", example: 5 },
          category_id: { type: "integer", example: 3 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductCreateRequest: {
        type: "object",
        required: ["name", "ref", "category_id"],
        properties: {
          name: { type: "string", example: "Filtro de Óleo" },
          ref: { type: "string", example: "FLT-001" },
          notes: { type: "string", nullable: true },
          cost_price: { type: "number", example: 25.5 },
          sale_price: { type: "number", example: 39.9 },
          amount: { type: "integer", example: 50 },
          minimum_amount: { type: "integer", example: 5 },
          category_id: { type: "integer", example: 3 },
        },
      },
      SaleItem: {
        type: "object",
        required: ["product_id", "quantity", "unit_price", "subtotal"],
        properties: {
          product_id: { type: "integer", example: 10 },
          quantity: { type: "integer", example: 2 },
          unit_price: { type: "string", example: "39.90" },
          subtotal: { type: "string", example: "79.80" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SaleCreateRequest: {
        type: "object",
        required: ["items"],
        properties: {
          sale_date: {
            type: "string",
            format: "date",
            example: "2026-11-14",
          },
          notes: {
            type: "string",
            nullable: true,
            example: "Venda com entrega agendada",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["product_id", "quantity"],
              properties: {
                product_id: { type: "integer", example: 10 },
                quantity: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      Sale: {
        type: "object",
        required: ["id", "user_id", "total_amount", "items"],
        properties: {
          id: { type: "integer", example: 5 },
          user_id: { type: "integer", example: 2 },
          total_amount: { type: "string", example: "79.80" },
          sale_date: {
            type: "string",
            format: "date",
            example: "2026-11-14",
          },
          notes: {
            type: "string",
            nullable: true,
            example: "Venda com entrega agendada",
          },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/SaleItem" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
