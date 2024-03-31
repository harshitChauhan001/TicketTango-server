const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

const mongooseConnection = require("./src/db/mongoose.js");

const UserRoutes = require("../server/src/routes/users.js");
const MovieRoutes = require("../server/src/routes/movies.js");
const TheaterRoutes = require("../server/src/routes/theater.js");
const ShowTimeRoutes = require("../server/src/routes/showTime.js");
const SeatRoutes = require("../server/src/routes/seat.js");
const TicketRoutes = require("../server/src/routes/ticket.js");

const app = express();
const Port = process.env.PORT || 3000;

app.use(express.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());




app.get("/", async (req, res) => {
  return res.send("This is ticket booking backend");
});

app.use("/user", UserRoutes);
app.use("/movie", MovieRoutes);
app.use("/theater", TheaterRoutes);
app.use("/showTime", ShowTimeRoutes);
app.use("/seat", SeatRoutes);
app.use("/ticket", TicketRoutes);

Promise.all([mongooseConnection()])
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(Port, () => {
      console.log(`Server is running on ${Port}`);
    });
  })
  .catch((err) => console.log(err.message));
