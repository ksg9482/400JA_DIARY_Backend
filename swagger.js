const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: '400JA Service', 
      version: '1.0.0', 
      description: '400JA API' 
    },
    servers: [
        {
          url: `http://localhost:8080`,
        },
    ]
};

const options = {
    swaggerDefinition,
    apis: ['./src/models/*.ts', './src/api/routes/*.ts']
};

export default options;