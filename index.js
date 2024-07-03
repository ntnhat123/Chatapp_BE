import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import auth from "./router/auth.js";
import chat from "./router/chat.js";
import message from "./router/message.js";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const SQL = "mongodb+srv://nhatnguyentk2:thanhnhattk12345@cluster0.3uvj0xf.mongodb.net/My_chat?retryWrites=true&w=majority&appName=Cluster0";

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.json());

app.use("/auth", auth);
app.use("/chat", chat);
app.use("/message", message);

//socket

let users = [];
io.on("connection", (socket) => {
  socket.on("online", (userId) => {
    if (!users.includes(userId)) {
      users.push({
        userId: userId,
        socketId: socket.id,
      });
    }
    io.emit("getUsers", users);
  });

  //chat
  socket.on("accessChat", (chat) => {
    socket.broadcast.emit("accessChat", chat);
  });
  //message
  socket.on("join", (idChat) => {
    console.log("idChat", idChat);
    socket.join(idChat);
  });
  socket.on("sendMessage", ({ data, idChat }) => {
    socket.broadcast.emit("notify", data);
    socket.to(idChat).emit("receiveMessage", data);
  });

  //group
  socket.on("reNameGroup", (data) => {
    // socket.to(data.chatId).emit("reNameGroup", data.chatName);
    io.in(data.chatId).emit("reNameGroup", data.chatName);
  });
  socket.on("leaveRoom", (data) => {
    console.log("data", data);
    socket.leave(data.chatId);
    socket.to(data.chatId).emit("leaveRoom", data.nameUser);
  });

  //typing
  socket.on("typing-start", (idChat) => {
    // socket.broadcast.emit("typing-start-server");
    socket.to(idChat).emit("typing-start-server");
  });

  socket.on("typing-end", (idChat) => {
    // socket.broadcast.emit("typing-end-server");
    socket.to(idChat).emit("typing-end-server");
  });
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

mongoose.set("strictQuery", false);
mongoose
  .connect(SQL)
  .then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(PORT, () =>
      console.log("Server is running on port 5000")
    );
  });
