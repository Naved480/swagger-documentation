const fs = require("fs");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const openapiPath = path.join(__dirname, "openapi.json");

/** Base spec shipped with the repo — single source of truth for Swagger UI (`/openapi.json`). */
const baseSpec = JSON.parse(fs.readFileSync(openapiPath, "utf8"));

const options = {
  definition: baseSpec,
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
