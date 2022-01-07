import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import socket from "socket.io";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
// import {fileTypeFromBuffer} from 'file-type';
// import {readChunk} from 'read-chunk';

import { PORT, MONGODB_URL, SERVER_Path } from "./config/index.js";
import { errorHandler } from "./errorHandler";
import router from "./routers";
import {
  getCurrentUser,
  userDisconnect,
  joinUser,
  getCurrentRoom,
  checkRoom,
  totalOnlineUsers,
} from "./socketUsers";
import Message from "./models/message";
import emailService from "./services/emailService";

// import socketIo from "./socketIo";

const app = express();

mongoose.connect(MONGODB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "100mb" }));

app.use("/uploads", express.static("uploads"));
app.use("/api", router);

app.use(errorHandler);

//mainUi
app.use(express.static(path.join(__dirname, "react/main/build")));
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "react/main/build", "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`server runing... on port ${PORT}`);
});
// console.log(server)

global.io = socket(server, { maxHttpBufferSize: 1e9 });
global.appRoot = path.resolve(__dirname);

//initializing the socket io connection
io.on("connection", (socket) => {
  console.log("Socket is Connected");
  //for a new user joining the room
  socket.on("joinChat", ({ sender, _id }) => {
    // username = user.name
    //* create user
    const pUser = joinUser(socket.id, sender, _id);
    console.log(socket.id, "=id");
    const isInRoom = socket.rooms.has(_id);

    console.log(isInRoom,`this is rooms: ${_id}`);
    socket.join(_id);

    socket.broadcast.emit("userJoin", {
      _id: pUser.sender._id,
      name: pUser.sender.name,
      text: `${pUser.sender.name} has joined the chat`,
    });
    // }
  });

  socket.on("checkOnline", () => {
    const userData = totalOnlineUsers();
    const users = userData.map((e) => e.sender._id);
    socket.emit("onlines", {
      users,
    });
  });

  //user sending message
  socket.on("chat", async (value) => {
    //gets the room user and the message sent
    // const pUser = getCurrentUser(socket.id);

    if (value._id != undefined) {
      // let message = await Message.Schema.statics.create(msg);
      let buffer;
      let filePath;
      let fileurl;
      let fileExt;
      let tempPath;

      if (value.file) {
        const matches = value.file.match(
          /^data:([A-Za-z-+\/\.]+);base64,(.+)$/
        );
        if (!matches) {
          return socket.emit("fileError", { message: "File Size Empty" });
        }
        if (!matches[0]) {
          return socket.emit("fileError", { message: "File Invalid" });
        }
        console.log(matches[1]);
        if (matches[1].includes("image")) {
          fileExt = matches[1].split("/")[1];
        } else if (matches[1].includes("pdf")) {
          fileExt = matches[1].split("/")[1];
        } else if (matches[1].includes("application/vnd.ms-excel")) {
          fileExt = "xls";
        } else if (matches[1].includes("ms-excel")) {
          fileExt = "csv";
        } else if (
          matches[1].includes(
            "vnd.openxmlformats-officedocument.wordprocessingml"
          )
        ) {
          fileExt = "docx";
        } else if (
          matches[1].includes(
            "vnd.openxmlformats-officedocument.presentationml"
          )
        ) {
          fileExt = "pptx";
        } else if (matches[1].includes("text/plain")) {
          fileExt = "txt";
        } else if (matches[1].includes("x-zip-compressed")) {
          fileExt = "zip";
        } else if (matches[1].includes("application/zip")) {
          fileExt = "zip";
        } else if (matches[1].includes("application/octet-stream")) {
          fileExt = "rar";
        } else if (
          matches[1].includes(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
        ) {
          fileExt = "xlsx";
        }
        if (!fileExt) {
          return socket.emit("fileError", { message: "File type invalid" });
        }

        buffer = Buffer.from(matches[2], "base64");
        filePath = `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileExt}`;
        fileurl = `/uploads/${filePath}`;
        tempPath = `${SERVER_Path}${fileurl}`;

        try {
          fs.writeFile(`./uploads/${filePath}`, buffer, "binary", (err) => {
            if (err) {
              console.log(err);
            }
          });
        } catch (err) {
          console.log(err);
        }
      }

      console.log(value.text, 'socketMessge')
      if (value.orderId) {
        socket.emit("orderMessage", {
          _id: value._id,
          name: value.sender.name,
          text: value.text,
          sender: value.sender,
          orderId: value.orderId,
          order: value.order ? value.order : {},
          ...(value.file && { file: [tempPath] }),
        });
        socket.in(value.receiver).emit("orderMessage", {
          _id: value._id,
          name: value.sender.name,
          text: value.text,
          sender: value.sender,
          orderId: value.orderId,
          order: value.order ? value.order : {},
          ...(value.file && { file: [tempPath] }),
        });
      } else {
        io.sockets.in(value._id).emit("message", {
          _id: value._id,
          name: value.sender.name,
          text: value.text,
          sender: value.sender,
          ...(value.file && { file: [tempPath] }),
        });
      }
      try {
        await Message.create(
          value.text,
          value.sender._id,
          value.sender.role,
          fileurl,
          value.receiver,
          value.orderId
        );
      } catch (err) {
        console.log(err);
      }
      // const roommate = getCurrentRoom(value._id);
      const clientsInRoom = io.sockets.adapter.rooms.get(value.receiver);
      if(clientsInRoom){
        if(clientsInRoom.size){
          console.log(clientsInRoom.size, `${value.receiver} room size is ${clientsInRoom.size}`)
        }
      }else{
        console.log(`${value.receiver} room is empty`)
      }
      console.log(clientsInRoom,'ClientInRoom')

      // if (!isInRoom) {
      //   console.log(isInRoom, "client is in the room!");
      //   // emailService.setMailToOfflineUser(value.receiver, value.text);
      // }
    }
  });
  socket.on("forceDisconnect", (id) =>{
    socket.disconnect(true);
    socket.leave(id);
    console.log(`${id} left room`);
  });

  socket.on("disconnect", () => {
    //the user is deleted from array of users and a left room message displayed
    const dUser = userDisconnect(socket.id);
    console.log(dUser, "disconnected");
    if (dUser) {
      socket.broadcast.emit("userDisconnet", {
        _id: dUser.sender._id,
        name: dUser.sender.name,
        text: `${dUser.sender._id} has left the chat`,
      });
    }
  });
});
