import express from "express";
import { loginController, messageController } from "../controllers";


const router = express.Router();
router.post('/register',loginController.register);
router.post('/login',loginController.login);
router.get('/user', loginController.getUser);


router.get('/message',messageController.getMessages);
router.get('/messages',messageController.getAllMessages);
router.get('/message/download/:file',messageController.download)
router.get('/messageuser',messageController.getMessageUsers)
router.get('/message/seen/:id', messageController.setSeenMessage)
router.get('/message/unseen/:id', messageController.unseenMessage)



export default router; 