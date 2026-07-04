import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import configurePassport from './config/passport.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import swaggerSpec from './docs/swagger.js';

const app = express();

// ─── Security ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────
const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: clientUrl && clientUrl !== '*' ? clientUrl.split(',').map(url => url.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// ─── Logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Sanitization ────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(xss());

// ─── Passport ────────────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

// ─── Rate Limiting (global) ──────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Swagger Docs ────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FlavorDash API Documentation'
}));

// ─── Health Check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FlavorDash API is running',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ────────────────────────────────────────────
app.use(errorHandler);

export default app;
