const winston = require('winston');
const { createLogger, format, transports } = winston;
const Logger = winston.Logger;
const { combine, timestamp, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const { DiscordTransport } = require('winston-transport-discord');
const { HiddenLogger } = require('winston/lib/winston/logger');

/*
    * Custom logger
*/
const defaultLogFormat = printf(({ level, message, timestamp }) => {
    return `[${level}][${timestamp}]: ${message}`;
});

const discordLogFormat = printf(({ level, message }) => {
    return `[${level}] ${message}`;
});

const setLevel = function (logLevel) {
    this.level = logLevel;
}
const enableConsoleTransport = function () {
    this.add(new transports.Console({
        format: winston.format.combine(
            colorize({ all: true }),
            timestamp(),
            defaultLogFormat
        )
    }))
}
const enableFileTransport = function () {
    this.add(new DailyRotateFile({
        format: winston.format.combine(
            timestamp(),
            defaultLogFormat
        ),
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
    }))
}
const enableDiscordTransport = function (webhookUrl) {
    this.add(new DiscordTransport({
        metadata: {
            host: 'CodeQL Agent'
        },
        discord: {
            webhook: {
                url: webhookUrl
            }
        },
        format: combine(discordLogFormat),
        level: 'info'
    }))
}

/*
    * There are two logger instances
    * 1. Default logger: defaultLogger. This logger is used for logging to console and file
    * 2. Bug logger: bugLogger. This logger is used for logging bugs found.
*/
var defaultLogger = new createLogger({});
var bugLogger = new createLogger({});

defaultLogger.setLevel = setLevel;
defaultLogger.enableConsoleTransport = enableConsoleTransport;
defaultLogger.enableFileTransport = enableFileTransport;
defaultLogger.enableDiscordTransport = enableDiscordTransport;

bugLogger.setLevel = setLevel;
bugLogger.enableConsoleTransport = enableConsoleTransport;
bugLogger.enableFileTransport = enableFileTransport;
bugLogger.enableDiscordTransport = enableDiscordTransport;

defaultLogger.setLevel('info')
defaultLogger.enableConsoleTransport()

bugLogger.setLevel('info')

module.exports.defaultLogger = defaultLogger;
module.exports.bugLogger = bugLogger;