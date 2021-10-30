import express from "express";
import { loginController, messageController, userController } from "../controllers";
import middle from '../middlewares'



const router = express.Router();
router.post('/register',middle.handleMultipartData,loginController.register);
router.post('/login',loginController.login);
router.post('/admin/login',loginController.adminLogin);


router.get('/user', userController.getUser);
router.get('/admin',userController.getAdmin );
router.get('/user/name/:search',userController.getUserSearch);
router.get('/user/messages/:id', userController.getUserMessages);


router.get('/message',messageController.getMessages);
router.get('/messages',messageController.getAllMessages);
router.get('/message/download/:file',messageController.download)
router.get('/messageuser',messageController.getMessageUsers)
router.get('/message/seen/:id', messageController.setSeenMessage)
router.get('/message/unseen/:id', messageController.unseenMessage)



export default router; 