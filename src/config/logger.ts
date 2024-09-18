//Sample Logger
import winston from 'winston';
import config from "./config";
const env = config.env;
const isLocal = env === 'development';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    return isLocal ? 'debug' : 'info';
};

//const isColorized = envConfig.ENVIRONMENT === 'localhost' ? true : false;

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

const customFormat = winston.format.printf((info) => {
    try {
        // Function to check if a value is an object and not null
        const isObject = (value: unknown) => typeof value === 'object' && value !== null;

        // Function to stringify an object if it is an object, otherwise return the value
        const stringifyIfObject = (value: unknown) => isObject(value) ? JSON.stringify(value) : value;

        // Combine all message parts if there are any additional arguments
        // and stringify objects if present
        const messageParts = [info.message, ...(info[Symbol.for('splat')] || [])].map(stringifyIfObject);
        const message = messageParts.join(' ');

        if (info.stack) {
            return `${info.timestamp} [${info.level}] : ${message}\n${info.stack}`;
        }
        return `${info.timestamp} [${info.level}] : ${message}`;
    } catch (error) {
        console.error("ERROR IN WINSTON LOGGER");
        return "";
    }
});

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    isLocal
        ? winston.format.colorize({ level: true })
        : winston.format.uncolorize(),
    customFormat,
);

const transports = [
    new winston.transports.Console(),
    //new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    //new winston.transports.File({ filename: 'logs/combined.log' }),
];

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default logger;
