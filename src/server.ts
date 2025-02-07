// Types from src/types/index.d.ts
/// <reference path="./types/index.d.ts" />
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import expressSession from 'express-session';
import httpStatus from 'http-status';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { xss } from './middleware/xss';
import { config } from './config/config';
import './config/auth'; //Passport strategies
import './config/db'; //Prisma client connection
//Routes
import authRoutes from './routes/v1/auth.routes';
import profileRoutes from './routes/v1/profile.routes';
import linkRoutes from './routes/v1/link.routes';
import searchRoutes from './routes/v1/search.routes';

import morgan from './middleware/morgan';
import errorHandler from './middleware/error-handler';
import logger from './config/logger';
import rateLimiter from './middleware/rate-limiter';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true
  })
);
// Allow preflight
app.options('*', cors());
app.use(xss());

// const client = createClient({
//   url: config.redisUrl
// });
// client.connect();
// client.on('error', function (error) {
//   console.error(error);
// });
// const redisStore = new RedisStore({
//   client,
//   prefix: 'okdm:'
// });

app.use(
  expressSession({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: false,
    //store: redisStore,
    cookie: {
      secure: true, // Set secure cookies in production
      maxAge: 60000 * 60 * 24 * 90, // 90 days
      domain: '.platinumj.dev',
       sameSite: 'none'
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

//app.use('/v1/auth', rateLimiter.authRateLimiterMiddleware, authRoutes);
app.use('/v1/auth', authRoutes);

//app.use(rateLimiter.otherRouteRateLimiterMiddleware); //Rate limiter for all other routes
app.use('/v1/profile', profileRoutes);
app.use('/v1/links', linkRoutes);
app.use('/v1/search', searchRoutes);
app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong'
  })
});
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).send('Not Found');
});

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
