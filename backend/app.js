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
const configuredClientUrls =
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const clientOrigins = Array.from(new Set([
  ...configuredClientUrls.split(",").map((url) => url.trim()).filter(Boolean),
  ...(process.env.NODE_ENV !== 'production'
    ? [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://[::1]:5173",
        "http://[::1]:5174"
      ]
    : [])
]));

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
