const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Toybox API",
      version: "1.0.0",
      description:
        "REST API for the Toybox vehicle booking and member services. " +
        "Module routes return `{ success, data }`. " +
        "Interactive docs are served at `/api-docs` when the server is running.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development (default `PORT` in `src/server.js`)",
      },
    ],
    tags: [
      { name: "Health", description: "Service liveness" },
      { name: "Auth", description: "Member sign-up, sign-in, profile, and photo upload" },
      { name: "Members", description: "Club members (Sequelize `Member`)" },
      { name: "Vehicles", description: "Vehicle catalog / garage records" },
      { name: "Requests", description: "Member–vehicle service requests and status" },
      { name: "Concierge", description: "Concierge placeholder / future messaging" },
      { name: "Notifications", description: "Notification channel and alert preferences" },
      { name: "Support", description: "Help center, FAQs, and contact shortcuts" },
      { name: "Events", description: "Club events, filters, RSVPs, and capacity" },
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
        HealthStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", example: "OK" },
          },
        },
        Member: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            roleId: { type: "integer", nullable: true, example: 1 },
            email: { type: "string", format: "email", example: "member@example.com" },
            name: { type: "string", nullable: true, example: "Alex Mitchell" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MemberCreate: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string" },
            roleId: { type: "integer" },
          },
        },
        Vehicle: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            make: { type: "string", example: "Porsche" },
            model: { type: "string", example: "911" },
            year: { type: "integer", example: 2023 },
            status: { type: "string", example: "Available" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        VehicleCreate: {
          type: "object",
          required: ["make", "model", "year"],
          properties: {
            make: { type: "string" },
            model: { type: "string" },
            year: { type: "integer", minimum: 1900, maximum: 2100 },
            status: { type: "string", default: "Available" },
          },
        },
        Request: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            status: {
              type: "string",
              example: "Requested",
              description: "Lifecycle status",
            },
            memberId: { type: "integer", example: 1 },
            vehicleId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RequestCreate: {
          type: "object",
          required: ["memberId", "vehicleId"],
          properties: {
            memberId: { type: "integer" },
            vehicleId: { type: "integer" },
            status: { type: "string", default: "Requested" },
          },
        },
        RequestStatusBody: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["Requested", "Accepted", "In Progress", "Completed"],
            },
          },
        },
        ModuleSuccessMembers: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Member" },
            },
          },
        },
        ModuleSuccessMember: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Member" },
          },
        },
        ModuleSuccessVehicles: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Vehicle" },
            },
          },
        },
        ModuleSuccessVehicle: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Vehicle" },
          },
        },
        ModuleSuccessRequests: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Request" },
            },
          },
        },
        ModuleSuccessRequest: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Request" },
          },
        },
        RequestLifecycleResult: {
          type: "object",
          properties: {
            id: { type: "string", description: "Request id from path" },
            status: { type: "string" },
          },
        },
        ModuleSuccessLifecycle: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/RequestLifecycleResult" },
          },
        },
        ConciergeMockItem: {
          type: "object",
          properties: {
            message: { type: "string", example: "Mock data for concierge" },
          },
        },
        ModuleSuccessConciergeList: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/ConciergeMockItem" },
            },
          },
        },
        ConciergeCreateResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Created concierge" },
            data: { type: "object", additionalProperties: true },
          },
        },
        ModuleSuccessConciergeCreate: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/ConciergeCreateResponse" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Server Error" },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "swagger", "*.doc.js"),
    path.join(__dirname, "modules", "**", "*.routes.js"),
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
