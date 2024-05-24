const mongoose = require("mongoose");
require("dotenv").config();

const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DATABASE } =
  process.env;

const CONNECTION_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DATABASE}?retryWrites=true&w=majority&appName=movie-ticket-cluster`;
// const CONNECTION_URL =
//   "mongodb+srv://harshit:W5JSUe0r5cISUryd@movie-ticket-cluster.y9ckedj.mongodb.net/movie_ticket_db?retryWrites=true&w=majority&appName=movie-ticket-cluster";

const mongooseConnection = async () => {
  try {
    await mongoose.connect(CONNECTION_URL, {});
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
};

module.exports = mongooseConnection;
