const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const { notFound, errorHandler } = require("./middlewares/errorHandler");
const userRoutes = require("../src/users/users.route");
const chatRoutes = require("../src/chats/chats.route");
const messageRoutes = require("../src/messages/messages.route");

dotenv.config();
const {
  connectToDatabase,
  disconnectFromDatabase,
} = require("./utils/database");

const app = express();
const PORT = process.env.PORT || 4000;

// app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server listening at http://localhost:${PORT}`);
});
const io = new Server(server, {
  pingTimeout: 60000,
  cors: "http://localhost:3000",
});

io.on("connection", (socket) => {
  console.log(`socket is connected`);

  socket.on("setup", (userData) => {
    console.log(userData._id);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("typing", (room) => {
    console.log("typing");
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

const signals = ["SIGTERM", "SIGINT"];

const gracefulShutdown = (signal) => {
  process.on(signal, async () => {
    logger.info(`Good bye signals ${signal}`);
    server.close();

    // disconnect db
    await disconnectFromDatabase();
    logger.info("my work is done");
    process.exit(0);
  });
};

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
