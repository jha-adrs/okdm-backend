// Instance of the database connection
import { Prisma, PrismaClient } from "@prisma/client";
import logger from "./logger";
import { config } from "./config";
interface Global {
    prisma?: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>;
}

const prismaClientConfig = {
    log: [
        { level: "query", emit: "event" },
        { level: "info", emit: "event" },
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
    ]
} satisfies Prisma.PrismaClientOptions
const globalForPrisma = globalThis as unknown as Global;
const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientConfig);

prisma.$connect().then(() => {
    logger.info("Connected to the database");
});
prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`, "time:", e.duration, "ms")
})
prisma.$on('warn', (e) => {
    logger.warn("Prisma Warning", e.message, e.target)
})

prisma.$on('info', (e) => {
    logger.info("Prisma Info", e.message)
})

prisma.$on('error', (e) => {
    logger.error("Prisma Error", e.message, e.timestamp)
})

if (config.env === "development") {
    //Prevent multiple instances of Prisma Client in development
    globalForPrisma.prisma = prisma;
}

export default prisma;