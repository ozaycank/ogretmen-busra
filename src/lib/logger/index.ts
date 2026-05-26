import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: isDev ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
        },
    } : undefined,
    formatters: {
        // label parametresine string tipi atandı
        level: (label: string) => {
            return { level: label.toUpperCase() };
        },
    },
    base: {
        env: process.env.NODE_ENV,
    },
});