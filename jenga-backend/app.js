const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});
const userRoutes = require("./routes/user.routes");
const serviceRoutes = require("./routes/service.routes");
const bookingsRoutes = require("./routes/bookings.routes");
const authRoutes = require("./routes/auth.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const availabilityRoutes = require("./routes/availability.routes");

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/services", serviceRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/auth", authRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/availability", availabilityRoutes);

// mount messages routes
const messagesRoutes = require('./routes/messages.routes');
app.use('/messages', messagesRoutes);

// initialize sockets
const initChatSocket = require('./sockets/chatSocket');
initChatSocket(io);

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = server;