const winston = require('winston');

// Default logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

logger.setLevel = function (logLevel) {
    this.clear()
    this.add(new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}

module.exports = logger;