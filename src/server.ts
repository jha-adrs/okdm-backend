import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import expressSession from 'express-session'
import httpStatus from 'http-status';
import RedisStore from 'connect-redis';
import { createClient } from 'redis'
import { xss } from './middleware/xss';
import { config } from './config/config'
import "./config/auth" //Passport strategies
import "./config/db" //Prisma client connection
//Routes
import authRoutes from './routes/v1/auth.routes';
import userRoutes from './routes/v1/user.routes';
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

const client = createClient({
    url: config.redisUrl
});
client.connect()
client.on("error", function(error) {
    console.error(error);
 });
const redisStore = new RedisStore({
    client,
    prefix: "okdm:"
})

app.use(expressSession({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: false,
    store: redisStore,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(morgan.successHandler)
app.use(morgan.errorHandler)

app.use("/v1/auth", authRoutes);
app.use("/v1/user", userRoutes);
app.use((req, res) => {
    res.status(httpStatus.NOT_FOUND).send("Not Found")
});

app.use(errorHandler);

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`)
})
