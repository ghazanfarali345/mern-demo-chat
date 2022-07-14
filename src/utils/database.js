const mongoose = require("mongoose");
const logger = require("./logger");

const DB_CONNECTION_STRING = process.env.DB_STRING;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_CONNECTION_STRING);
    logger.info("Connect to database");
  } catch (error) {
    console.log({ error });
    logger.error("Failed to connect to datatabse");
    process.exit(1);
  }
};

const disconnectFromDatabase = async () => {
  await mongoose.connection.close();
  logger.info("Disconnect from database");
  return;
};

module.exports = { connectToDatabase, disconnectFromDatabase };
