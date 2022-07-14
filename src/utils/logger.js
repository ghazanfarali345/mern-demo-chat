const pino = require("pino");

let logger;

if (process.env.NODE_ENV !== "production") {
  logger = pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });
} else {
  logger = console;
}

module.exports = logger;
