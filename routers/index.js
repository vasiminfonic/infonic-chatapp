import express from "express";
import { loginController, messageController, orderController, userController } from "../controllers";
import mainOrderController from "../controllers/mainOrderController";
import middle from '../middlewares'



const router = express.Router();
router.post('/register',middle.handleMultipartData,loginController.register);
router.post('/login',loginController.login);
router.post('/admin/login',loginController.adminLogin);
router.get('/refresh',loginController.getRefresh);
router.post('/forgot/otp',loginController.getFogotUser);
router.post('/forgot/verify',loginController.verifyUserOtp);


router.get('/user', userController.getUser);
router.post('/user/update/:id',middle.handleMultipartData,userController.updateUser);
router.get('/users', userController.getUsers);
router.get('/admin',userController.getAdmin );
router.get('/user/name/:search',userController.getUserSearch);
router.get('/user/messages/:id', userController.getUserMessages);



router.get('/order', orderController.getOrder);
router.post('/order', middle.handleMultipartDataOrder, orderController.postOrder);
router.get(`/order/user/:id`, orderController.getUserByOrder);
router.get('/order/search/:search', orderController.getOrderSearch);
router.get('/orders/user/:id', orderController.getOrdersofUser);


router.post('/mainorder',middle.handleMultipartDataMainOrder ,mainOrderController.addOrder);
router.get('/mainorder', mainOrderController.getOrders)
router.post('/mainorder/:id', mainOrderController.updateOrder)
router.get('/mainorder/:id',mainOrderController.getOrderById)
router.get('/mainorder/user/:id',mainOrderController.getOrdersofUser)


router.get('/message',messageController.getMessages);
router.get('/messages',messageController.getAllMessages);
router.get('/message/download/:file',messageController.download)
router.get('/messageuser',messageController.getMessageUsers)
router.get('/message/seen/:id', messageController.setSeenMessage)
router.get('/message/unseen/:id', messageController.unseenMessage)
router.get('/message/unseen/user/:id', messageController.unseenUserMessage);
router.get("/message/unseen/order/:id", messageController.setSeenOrderMessage);
router.get('/message/order/:id', messageController.getOrderMessages)



export default router; 