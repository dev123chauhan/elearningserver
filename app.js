const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./api/routes/users");
const coursesRoute = require("./api/routes/courses");
const enrollmentRoutes = require('./api/routes/enrollment');
const subscribeRoutes = require('./api/routes/subscribe');
const connectDB = require("./config/db");
dotenv.config();
const app = express();
app.use(cors()); 
app.use(bodyParser.json());
connectDB()
 
app.use('/api/contact', require('./api/routes/contact'));
app.use('/api/subscribe', subscribeRoutes);
app.use("/api", userRoutes);
app.use("/api", coursesRoute);
app.use('/api', enrollmentRoutes);
app.get('*', (req, res) => {
  res.status(200).json({ message: 'bad request' });
});

module.exports = app;



