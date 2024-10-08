const fs = require('fs');
const path = require('path');

// Middleware to capture and append request data to Swagger setup
module.exports = (req, res, next) => {
    // Get the request details
    const method = req.method.toLowerCase();
    const routePath = req.route ? req.route.path : req.path;

    // Prepare an array to store parameters
    const parameters = [];

    // Collect query parameters
    if (Object.keys(req.query).length > 0) {
        Object.keys(req.query).forEach((param) => {
            parameters.push({
                name: param,
                in: 'query',
                required: false,
                type: 'string'
            });
        });
    }

    // Prepare body schema if the body contains any data
    if (req.body && Object.keys(req.body).length > 0) {
        const bodySchema = {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
                type: 'object',
                properties: {}
            }
        };

        // Dynamically add properties from the body
        Object.keys(req.body).forEach((param) => {
            bodySchema.schema.properties[param] = {
                type: 'string',
                example: req.body[param] || 'example'
            };
        });

        // Add body schema to parameters
        parameters.push(bodySchema);
    }

    // Prepare Swagger entry for the API endpoint
    const swaggerEntry = {
        [routePath]: {
            [method]: {
                tags: ['API'], // You can change this tag to something relevant to your project
                description: '',
                parameters: parameters,
                responses: {
                    200: {
                        description: 'Successful operation'
                    }
                }
            }
        }
    };

    // Path to the Swagger setup file
    const swaggerFilePath = path.join(__dirname, 'swagger_output.json');

    // Read the existing Swagger configuration
    fs.readFile(swaggerFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Swagger file:', err);
            return next();
        }

        // Parse the existing Swagger file
        const swaggerConfig = JSON.parse(data);

        // Append the new route information
        swaggerConfig.paths = {
            ...swaggerConfig.paths,
            ...swaggerEntry
        };

        // Write the updated configuration back to the Swagger file
        fs.writeFile(swaggerFilePath, JSON.stringify(swaggerConfig, null, 2), (err) => {
            if (err) {
                console.error('Error writing Swagger file:', err);
            } else {
                console.log(`Updated Swagger setup for ${routePath}`);
            }
        });
    });

    // Move to the next middleware or route
    next();
};
