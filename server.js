const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Mail Inbox API',
      version: '1.0.0',
      description: 'API documentation for the Mail Inbox application',
    },
    servers: [{
      url: PORT,
    }, ],
  },
  apis: ['./routes/mail.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(cors({
  origin: ['http://localhost:3000',process.env.FFRONT_END],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => res.send('API is running'));
app.use('/api', require('./routes/mail'));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));