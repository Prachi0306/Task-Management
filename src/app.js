const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors(config.cors));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(hpp());

app.use('/api', generalLimiter);

app.use('/api', routes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));
}

app.use((req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
