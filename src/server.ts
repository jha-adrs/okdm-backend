import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import expressSession from 'express-session'
import httpStatus from 'http-status';
import { xss } from './middleware/xss';
import { config } from './config/config';
import "./config/auth" //Passport strategies
import "./config/prisma" //Prisma client connection
//Routes
import authRoutes from './routes/v1/auth.routes';
import morgan from './middleware/morgan';
import errorHandler from './middleware/error-handler';
import logger from './config/logger';
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(compression())
app.use(cors({
    origin: config.allowedOrigins
}))
// Allow preflight
app.options('*', cors());
app.use(xss())

app.use(expressSession({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(morgan.successHandler)
app.use(morgan.errorHandler)

app.use("/v1/auth", authRoutes);

app.use((req, res) => {
    res.status(httpStatus.NOT_FOUND).send("Not Found")
});

app.use(errorHandler);

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`)
})
