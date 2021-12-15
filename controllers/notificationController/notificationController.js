import mongoose from "mongoose";
import { customErrorHandler } from "../../errorHandler";
import Notification from "../../models/notification";

const NotificationController = {
  async getNotifications(req, res, next) {
    const { id } = req.params;
    try {
      const notification = await Notification.find({$and:[{ userId: id }, {seen: false}]}, "-__v", {
        limit: 20,
        sort: { createdAt: -1 },
      });
      if (!notification) {
        return res
          .status(200)
          .json({ message: "empty notifications", data: [] });
      }
      res
        .status(200)
        .json({ message: "notification fetched", data: notification });
    } catch (err) {
      console.log(err);
      next(customErrorHandler.serverError());
    }
  },

  async setSeenNotification(req, res, next) {
    const { id } = req.params;
    try {
      await Notification.findByIdAndUpdate(id, { seen: true });
    } catch (er) {
      next(customErrorHandler.serverError(er));
    }
  },
};
export default NotificationController;
