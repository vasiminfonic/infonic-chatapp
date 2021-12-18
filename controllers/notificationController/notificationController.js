import mongoose from "mongoose";
import { customErrorHandler } from "../../errorHandler";
import Notification from "../../models/notification";

const NotificationController = {
  async getNotificationsUnseen(req, res, next) {
    const { id } = req.params;
    try {
      const notification = await Notification.find(
        { $and: [{ userId: id }, { seen: false }] },
        "-__v",
        {
          limit: 20,
          sort: { createdAt: -1 },
        }
      );
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
  async getNotificationById(req, res, next) {
    const { id } = req.params;
    const { page, row } = req.query;
    const limit = +(row ? (row < 10 ? 10 : row) : 10);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const count = await Notification.countDocuments({ userId: id });
      const notifiacation = await Notification.find({ userId: id }, "", {
        limit,
        skip,
        sort: { createdAt: -1 },
      });
      if (!notifiacation) {
        return res.status(200).json({ data: [] });
      }
      res.status(200).json({ data: notifiacation, total: count });
    } catch (err) {
      next(customErrorHandler.serverError(er));
    }
  },
};
export default NotificationController;
