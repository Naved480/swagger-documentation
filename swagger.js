const fs = require("fs");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const openapiPath = path.join(__dirname, "openapi.json");
const pathSource = JSON.parse(fs.readFileSync(openapiPath, "utf8"));

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
      { name: "Vehicles", description: "Add / update vehicles (wizard)" },
      { name: "Garage", description: "My Garage — list, details, health, docs, service requests" },
      { name: "Requests", description: "Member–vehicle service requests and status" },
      { name: "Concierge", description: "Concierge placeholder / future messaging" },
      { name: "Notifications", description: "Notification channel and alert preferences" },
      { name: "Support", description: "Help center, FAQs, and contact shortcuts" },
      { name: "Events", description: "Club events, filters, RSVPs, and capacity" },
    ],
    paths: pathSource.paths || {},
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
        VehicleHealthItem: {
          type: "object",
          required: ["category", "percentage"],
          properties: {
            category: {
              type: "string",
              enum: [
                "engine_drivetrain",
                "tyres",
                "brakes",
                "fluids",
                "battery",
                "exterior_body",
              ],
            },
            percentage: { type: "integer", minimum: 0, maximum: 100, example: 85 },
            note: { type: "string", nullable: true },
          },
        },
        VehicleInfo: {
          type: "object",
          required: [
            "model",
            "year",
            "engine",
            "power",
            "transmission",
            "drive",
            "zeroToHundred",
            "topSpeed",
          ],
          properties: {
            name: { type: "string", example: "Lamborghini", description: "Brand / make" },
            make: { type: "string", example: "Lamborghini" },
            model: { type: "string", example: "Huracan STO" },
            year: { type: "integer", example: 2022 },
            engine: { type: "string", example: "5.2L Naturally Aspirated V10" },
            power: { type: "string", example: "640 hp, 565 Nm" },
            transmission: { type: "string", example: "7-speed LDF dual-clutch" },
            drive: { type: "string", example: "Rear-wheel drive" },
            zeroToHundred: { type: "string", example: "3.0 seconds" },
            topSpeed: { type: "string", example: "310 km/h" },
          },
        },
        VehicleOwnershipInfo: {
          type: "object",
          required: ["colour", "chassisNo", "plate", "purchasedAt", "storageBay", "mileage"],
          properties: {
            colour: { type: "string", example: "Nero Assoluto" },
            chassisNo: { type: "string", example: "ZHWEC2ZF0NLA14901" },
            plate: { type: "string", example: "Dubai - A 12345" },
            purchasedAt: { type: "string", format: "date", example: "2022-01-01" },
            storageBay: { type: "string", example: "Bay A-04, Level 1" },
            mileage: { type: "string", example: "12,450 km" },
          },
        },
        VehicleAdd: {
          type: "object",
          required: ["vehicleInfo", "ownershipInfo", "health"],
          properties: {
            vehicleInfo: { $ref: "#/components/schemas/VehicleInfo" },
            ownershipInfo: { $ref: "#/components/schemas/VehicleOwnershipInfo" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            documents: {
              type: "object",
              description: "Optional pre-uploaded document URLs",
            },
            status: { type: "string", example: "Available" },
            registrationStep: {
              type: "string",
              enum: ["vehicle_info", "ownership", "docs", "health", "complete"],
            },
          },
        },
        VehicleAddPartial: {
          type: "object",
          properties: {
            vehicleInfo: { $ref: "#/components/schemas/VehicleInfo" },
            ownershipInfo: { $ref: "#/components/schemas/VehicleOwnershipInfo" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            documents: { type: "object" },
            status: { type: "string" },
            registrationStep: { type: "string" },
          },
        },
        Vehicle: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            make: { type: "string", example: "Lamborghini" },
            model: { type: "string", example: "Huracan STO" },
            year: { type: "integer", example: 2022 },
            status: { type: "string", example: "Available" },
            engine: { type: "string" },
            power: { type: "string" },
            transmission: { type: "string" },
            drive: { type: "string" },
            zeroToHundred: { type: "string" },
            topSpeed: { type: "string" },
            colour: { type: "string" },
            chassisNo: { type: "string" },
            plate: { type: "string" },
            purchasedAt: { type: "string", format: "date" },
            storageBay: { type: "string" },
            mileage: { type: "string" },
            documents: { type: "object" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            registrationStep: { type: "string" },
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
