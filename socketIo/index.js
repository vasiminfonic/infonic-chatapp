import socketController from "./contollers/socketController"

const socketIo = (io) =>{
    return io.on('connection', socketController.connection)
}

export default socketIo

