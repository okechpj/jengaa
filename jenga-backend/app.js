const express = require('express');
const app = express();
const port = 3000;
const userRoutes = require("./routes/user.routes");
const serviceRoutes = require("./routes/service.routes");
const bookingsRoutes = require("./routes/bookings.routes");
const authRoutes = require("./routes/auth.routes");
const reviewsRoutes = require("./routes/reviews.routes");

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/services", serviceRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/auth", authRoutes);
app.use("/reviews", reviewsRoutes);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;