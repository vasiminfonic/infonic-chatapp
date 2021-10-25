import { io } from '../../server';
const socketController = {
  
 connection (socket) {
    socket.on("joinChat", (user)=>{
       console.log(user,"user");
        socket.join('InfonicChats');
        socket.emit("message", {
            userId: socket.id,
            name: user.name,
            text: `Welcome ${user.name}`,
          });
          socket.broadcast.to('InfonicChats').emit("message", {
            userId: socket.id,
            name: user.name,
            text: `${user.name} has joined the chat`,
          });
    })
    socket.on("chat", (text,user) => {
        io.to('InfonicChats').emit("message", {
          userId: socket.id,
          name: user.name,
          text: text,
        });
      });
     socket.on("disconnect", (user) => {
       //the user is deleted from array of users and a left room message displayed
       if (socket.id) {
         io.to("InfonicChats").emit("message", {
           userId: socket.id,
           name: user.name,
           text: `${name} has left the room`,
         });
       }
     });
  }  
}

export default socketController;