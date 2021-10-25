import express from "express";
import mongoose from "mongoose";
import cors from 'cors'
import socket from 'socket.io';
import fs from 'fs'
import Jimp from 'jimp';
import path from 'path';
import nodemailer from 'nodemailer'
// import {fileTypeFromBuffer} from 'file-type';
// import {readChunk} from 'read-chunk';



import { PORT, MONGODB_URL, SERVER_Path } from "./config";
import { errorHandler } from "./errorHandler";
import router from "./routers";
import { getCurrentUser, userDisconnect, joinUser, getCurrentRoom, checkRoom } from "./socketUsers";
import Message from "./models/message";
import { match } from "assert";
import User from "./models/user";

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

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use('/uploads', express.static('uploads'));
app.use('/api', router);

app.use(errorHandler);

//clientUi
app.use('/client',express.static(path.join(__dirname, 'react/client/build')));
app.get('/client/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'react/client/build', 'index.html'));
});


//mainUi
app.use('/', express.static(path.join(__dirname, 'react/main/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'react/main/build', 'index.html'));
});




const server = app.listen(PORT, () => {
  console.log(`server runing... on port ${PORT}`);
})
// console.log(server)





global.io = socket(server);

//initializing the socket io connection 
io.on("connection", (socket) => {
  console.log('Socket is Connected')
  //for a new user joining the room
  let id;
  let username;
  socket.on("joinChat", ({user, _id}) => {
    // username = user.name
    //* create user
    const pUser = joinUser(socket.id, user, _id);
    // console.log(_id, "=id");

    socket.join(pUser.room);

    //display a welcome message to the user who have joined a room
    if(pUser.user){
    socket.emit("message", {
      _id: _id,
      name: pUser.user.name,
      text: `Welcome ${pUser.user.name}`,
      type: pUser.user.role
    });
    //displays a joined room message to all other room users except that particular user
    socket.broadcast.emit("userJoin", {
      _id: _id,
      name: pUser.user.name,
      text: `${pUser.user.name} has joined the chat`,
    });
  }
  });
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
      if (value.file) {
       
        var matches = value.file.match(/^data:([A-Za-z-+\/\.]+);base64,(.+)$/);     
        console.log(matches[1]);

        if(matches[1].includes('image')){
          fileExt = matches[1].split('/')[1];
        } else if(matches[1].includes('pdf')){
          fileExt = matches[1].split('/')[1];
        }else if(matches[1].includes('ms-excel')){
          fileExt = 'csv';
        }else if(matches[1].includes('vnd.openxmlformats-officedocument.wordprocessingml')){
          fileExt = 'docx';
        }else if(matches[1].includes('vnd.openxmlformats-officedocument.presentationml')){
          fileExt = 'pptx';
        }else if(matches[1].includes('text/plain')){
          fileExt = 'txt';
        }
        else if(matches[1].includes('x-zip-compressed')){
          fileExt = 'zip';
        }

        buffer = Buffer.from(matches[2], 'base64');
        filePath = `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileExt}`;
        fileurl = `${SERVER_Path}/uploads/${filePath}`;

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

      io.to(value._id).emit("message", {
        _id: value._id,
        name: value.user.name,
        type: value.user.role,
        text: value.text,
        user: value.user,
        ...(value.file && { file: [fileurl] })
      });
      socket.broadcast.emit("userMessage", {
        _id: value._id,
        name: value.user.name,
        text: `${value.text}`,
      });
      
      try {
        await Message.create(value.text, value.user._id, value.user.role, fileurl, value.receiver);
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
    const p_user = userDisconnect(socket.id);
    if (id != undefined) {
      io.to(id).emit("message", {
        _id: id,
        name: username,
        text: `${username} has left the chat`,
      });
    }
  });
});





