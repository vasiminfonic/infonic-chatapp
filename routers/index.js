import express from "express";
import { loginController, messageController, orderController, userController } from "../controllers";
import assignOrderControll from "../controllers/assignOrderController/assignOrderController";
import mainOrderController from "../controllers/mainOrderController";
import NotificationController from "../controllers/notificationController/notificationController";
import translationController from "../controllers/translationController";
import middle from '../middlewares';
import authMiddleware from "../middlewares/authMiddleware";




const router = express.Router();
router.post('/register',middle.handleMultipartData,loginController.register);
router.post('/login',loginController.login);
router.post('/admin/login',loginController.adminLogin);
router.get('/refresh',loginController.getRefresh);
router.post('/forgot/otp',loginController.getFogotUser);
router.post('/forgot/verify',loginController.verifyUserOtp);


router.get('/user', userController.getUser);
router.get("/single-user/:id", userController.getSingleUser);
router.post(
  "/edit-user/:id",
  middle.handleMultipartData,
  userController.editUser
);
router.post('/user/update/:id',middle.handleMultipartData,userController.updateUser);
router.get('/users', userController.getUsers);
router.get('/admin',userController.getAdmin );
router.get('/sub-admin', userController.getSubAdmin);
router.get('/user/name/:search',userController.getUserSearch);
router.get('/user/messages/:id', userController.getUserMessages);
router.get("/users/order", userController.getUsersWithOrder);
router.get("/user/delete/:id", userController.deleteUser);



router.get('/order', orderController.getOrder);
router.post('/order', middle.handleMultipartDataOrder, orderController.postOrder);
router.get(`/order/user/:id`, orderController.getUserByOrder);
router.get('/order/search/:search', orderController.getOrderSearch);
router.get('/orders/user/:id', orderController.getOrdersofUser);

router.post('/assign-order', assignOrderControll.assign);
router.get("/assign-order/:userId", assignOrderControll.getAssignOrder);

router.post('/mainorder',middle.handleMultipartDataMainOrder ,mainOrderController.addOrder);
router.get('/mainorder' ,mainOrderController.getOrders)
router.put(
  "/mainorder/:id",
  middle.handleMultipartDataMainOrder,
  mainOrderController.updateOrder
);
router.get('/mainorder/:id',mainOrderController.getOrderById)
router.get('/mainorder/user/:id',mainOrderController.getOrdersofUser)


router.post(
  "/translation",
  middle.handleMultipartDataMainOrder,
  translationController.addOrder
);
router.get("/translation", authMiddleware.checkAuth, translationController.getOrders);
router.put(
  "/translation/:id",
  middle.handleMultipartDataMainOrder,
  translationController.updateOrder
);
router.get("/translation", authMiddleware.checkAuth, translationController.getOrders);


router.put(
  "/translation/status/:id",
  translationController.changeStatus
);

router.get(
  "/translation/chat-order/admin/:id",
  translationController.getChatsOrder
);
router.get("/translation/chat-order/:id", translationController.getUserChatsOrder);
router.get("/translation/:id", translationController.getOrderById);
router.get("/translation/user/:id", translationController.getOrdersofUser);
router.get("/translation/filter/user/:id", translationController.getOrdersofUserSearch);
router.get(
  "/translation/filter/order",
  translationController.getOrdersofAdimnSearch
);
router.get(
  "/translation/await/:id",
  translationController.getOrdersByAwait
);
router.get(
  "/translation/sub-admin/await/:id",
  translationController.getOrdersByAwaitForSubAdmin
);



router.get("/notification/:id", NotificationController.getNotificationsUnseen);
router.get("/notification/seen/:id", NotificationController.setSeenNotification);
router.get('/notification/all/:id', NotificationController.getNotificationById);



router.get('/message',messageController.getMessages);
router.get('/messages',messageController.getAllMessages);
router.get('/message/download/:file',messageController.download)
router.get('/messageuser',messageController.getMessageUsers)
router.get('/message/seen/:id', messageController.setSeenMessage)
router.get('/message/unseen/:id', messageController.unseenMessage)
router.get('/message/unseen/user/:id', messageController.unseenUserMessage);
router.get("/message/unseen/order/:id", messageController.setSeenOrderMessage);
router.get('/message/order/:id', messageController.getOrderMessages);
router.get("/message/filter/:id", messageController.getOrderMessagesByDate);




export default router; 