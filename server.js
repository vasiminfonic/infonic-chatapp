import express from "express";
import mongoose from "mongoose";
import cors from 'cors'
import socket from 'socket.io';
import fs from 'fs'
import path from 'path';
import nodemailer from 'nodemailer'
// import {fileTypeFromBuffer} from 'file-type';
// import {readChunk} from 'read-chunk';



import { PORT, MONGODB_URL, SERVER_Path } from "./config";
import { errorHandler } from "./errorHandler";
import router from "./routers";
import { getCurrentUser, userDisconnect, joinUser, getCurrentRoom, checkRoom,totalOnlineUsers } from "./socketUsers";
import Message from "./models/message";

// import socketIo from "./socketIo";


const app = express();

mongoose.connect(MONGODB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('DB connected...');
});

app.use(
  cors()
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "100mb" }));


app.use('/uploads', express.static('uploads'));
app.use('/api', router);

app.use(errorHandler);


//mainUi
app.use(express.static(path.join(__dirname, 'react/main/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'react/main/build', 'index.html'));
});


const server = app.listen(PORT, () => {
  console.log(`server runing... on port ${PORT}`);
})
// console.log(server)





global.io = socket(server);
global.appRoot = path.resolve(__dirname);


//initializing the socket io connection 
io.on("connection", (socket) => {
  console.log('Socket is Connected')
  //for a new user joining the room
  socket.on("joinChat", ({sender, _id}) => {
    // username = user.name
    //* create user
    const pUser = joinUser(socket.id, sender, _id);
    console.log(socket.id, "=id");

    socket.join(pUser.room);
   

    //display a welcome message to the user who have joined a room
  //   if(pUser.user){
  //   socket.emit("message", {
  //     _id: _id,
  //     name: pUser.user.name,
  //     text: `Welcome ${pUser.user.name}`,
  //     type: pUser.user.role
  //   });
  //   //displays a joined room message to all other room users except that particular user
    socket.broadcast.emit("userJoin", {
      _id: pUser.sender._id,
      name: pUser.sender.name,
      text: `${pUser.sender.name} has joined the chat`,
    });
  // }
  });

  socket.on('checkOnline',()=>{
    const userData = totalOnlineUsers();
    const users = userData.map(e=>e.sender._id);
      socket.emit('onlines',{
        users
      })
  })

  //user sending message
  socket.on("chat", async (value) => {
    //gets the room user and the message sent
    // const pUser = getCurrentUser(socket.id);
    console.log(value.text,'socket');
    

    if (value._id != undefined) {
      // let message = await Message.Schema.statics.create(msg);
      let buffer;
      let filePath;
      let fileurl;
      let fileExt;
      let tempPath;
      
      if (value.file) {
        var matches = value.file.match(/^data:([A-Za-z-+\/\.]+);base64,(.+)$/);     
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
        } else if (
          matches[1].includes(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
        ) {
          fileExt = "xlsx";
        } 

        buffer = Buffer.from(matches[2], 'base64');
        filePath = `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileExt}`;
        fileurl = `/uploads/${filePath}`;
        tempPath = `${SERVER_Path}${fileurl}`;

        try {
          fs.writeFile(`./uploads/${filePath}`, buffer, 'binary',(err) => {
            if (err) {
              console.log(err);
            }
          })
        } catch (err) {
          console.log(err);
        }
      }
      if(value.orderId){
        io.to(value._id)
          .to(value.receiver)
          .emit("orderMessage", {
            _id: value._id,
            name: value.sender.name,
            text: value.text,
            sender: value.sender,
            orderId: value.orderId,
            order: value.order ? value.order : {},
            ...(value.file && { file: [tempPath] }),
          });
      }else{
        io.to(value._id).emit("message", {
          _id: value._id,
          name: value.sender.name,
          text: value.text,
          sender: value.sender,
          ...(value.file && { file: [tempPath] }),
        });
      }
      try {
        await Message.create(value.text, value.sender._id, value.sender.role, fileurl, value.receiver, value.orderId);
      } catch(err) {
        console.log(err);
      }
    // const roommate = getCurrentRoom(value._id);
    const { empty } = checkRoom(value._id);
    console.log(empty, 'checkfdkljasd');

    if(empty ==='admin' || empty === 'user'){
      const emailId = empty === 'admin' ? '' : value._id 
      // const email = await User.email(emailId);
      // console.log(email, 'emait--$$$$');

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'vasim.infonic@gmail.com', // generated ethereal user
          pass: 'qiwpdofprhvkeevk', // generated ethereal password
        },
      });
      let info = await transporter.sendMail({
        from: 'vasim.infonic@gmail.com', // sender address
        to: 'vasim.infonic@gmail.com', // list of receivers
        subject: "new Message from infonic", // Subject line
        text: value.text, // plain text body
        html: `<b>Hello world<br>${value.text}</b>`, // html body
      });
      console.log(info);
    }
    }

  });

  socket.on("disconnect", () => {
    //the user is deleted from array of users and a left room message displayed

    const dUser = userDisconnect(socket.id);
    console.log(dUser, 'disconnect');
    if(dUser){
      socket.broadcast.emit("userDisconnet",{
        _id: dUser.sender._id,
        name: dUser.sender.name,
        text: `${dUser.sender._id} has left the chat`,
      });
    }
      
  });
});





