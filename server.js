const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const swaggerFilePath = './swagger_output.json';
const swaggerMiddleware = require('./middleware-file'); // Middleware that appends to swagger

const app = express();
app.use(bodyParser.json());

// Middleware to append request data to Swagger output
app.use(swaggerMiddleware);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, (req, res) => {
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
    res.send(swaggerUi.generateHTML(swaggerDocument));
});

// Example API to test - only /api/user will be processed
app.post('/api/user', (req, res) => {
    const { name, email } = req.body;
    res.json({ message: 'User created', user: { name, email } });
});

// Middleware to exclude Swagger static files from Swagger output
app.use((req, res, next) => {
    if (req.path.startsWith('/api-docs') || req.path === '/favicon.ico') {
        // Skip logging Swagger files and favicon requests
        return next();
    }
    next();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);

    // Dummy data requests for testing
    // simulateRequests();
});

// Simulate sending data to the endpoints
function simulateRequests() {
    const axios = require('axios');

    // Dummy POST request to /api/user
    axios.post(`http://localhost:${PORT}/api/user`, {
        name: 'Don Lee',
        email: 'donlee@example.com'
    }).then(response => {
        console.log('POST /api/user response:', response.data);
    }).catch(error => {
        console.error('Error in POST /api/user:', error.message);
    });
}
