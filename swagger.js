const swaggerDefinition = {
    openapi: '3.0.0',
    info: { // API informations (required)
      title: '400JA Service', // Title (required)
      version: '1.0.0', // Version (required)
      description: '400JA API' // Description (optional)
    },
    servers: [
        {
          url: `http://localhost:8080`,
        },
    ]
};

const options = {
    // Import swaggerDefinitions
    swaggerDefinition,
    // Path to the API docs
    apis: ['./src/models/*.ts']
};

export default options;