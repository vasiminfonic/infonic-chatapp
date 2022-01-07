import TranslationOrder from "../../models/tralationOrders";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import crypto from "crypto";
import mongoose from "mongoose";
import Notification from "../../models/notification";
import { SERVER_Path } from "../../config";
import emailService from "../../services/emailService";
import Message from "../../models/message";

const translationController = {
  async addOrder(req, res, next) {
    try {
      const {
        name,
        email,
        phone,
        country,
        websiteId,
        service_req,
        sourceLanguage,
        targetlanguage,
        your_words,
        certification,
        message,
        notarization,
        deadline,
      } = req.body;
      let user;
      try {
        user = await User.findOne({ email });
        if (!user) {
          const password = crypto.randomBytes(5).toString("hex");
          user = await User.create({
            name,
            email,
            password,
            country,
            phone,
          });
          emailService.sendMailNewUser(user);
        } else {
          emailService.sendMailExistUser(user);
        }
      } catch (err) {
        console.log(err);
        return next(customErrorHandler.serverError());
      }
      const filesUrl = req.files.map((e) => e.path);
      let order = await TranslationOrder.create({
        userId: user._id,
        phone,
        service_req,
        sourceLanguage,
        targetlanguage,
        your_words,
        certification,
        message,
        notarization,
        websiteId,
        deadline,
        country,
        ...(filesUrl.length && { files: filesUrl }),
      });
      if (!order) {
        return next(customErrorHandler.emptyData());
      }
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ? user.image : "",
      };
      const orderData = {
        _id: order._id,
        phone: order.phone,
        service_req: order.service_req,
        sourceLanguage: order.sourceLanguage,
        targetlanguage: order.targetlanguage,
        your_words: order.your_words,
        certification: order.certification,
        message: order.message,
        notarization: order.notarization,
        deadline: order.deadline,
        country: order.country,
        status: order.status,
        ...(order.files.length && {
          files: filesUrl.map((e) => `${SERVER_Path}/${e}`),
        }),
        translationId: order.translationId,
        userId: userData,
      };
      let admin;
      emailService.sendMailNewOrder(orderData);
      try {
        admin = await User.findOne(
          { role: "admin" },
          "-password -updatedAt -__v"
        );
        if (!admin) {
          return next(customErrorHandler.serverError("admin Not found"));
        }
      } catch (er) {
        console.log(er);
        return next(customErrorHandler.serverError());
      }

      try {
        const notification = await Notification.create(
          {
            notification: "new order received",
            type: "order",
            userId: admin._id,
            info: orderData,
          },
          {
            notification: "your order received",
            type: "order",
            userId: user._id,
            info: orderData,
          }
        );
        io.sockets
          .in(admin._id.toString())
          .emit("notification", notification[0]);
        io.sockets
          .in(user._id.toString())
          .emit("notification", notification[1]);
      } catch (err) {
        console.log(err);
        next(customErrorHandler.serverError(err));
      }
      const { authorization } = req.headers;
      if (authorization) {
        return res
          .status(200)
          .json({ message: "Order Created SuccessFully", data: orderData });
      } else {
        res.redirect(
          `https://www.singaporetranslators.com/thanks?id=${orderData.translationId}&email=${user.email}`
        );
      }
    } catch (e) {
      console.log(e);
      next(customErrorHandler.serverError(e));
    }
  },
  async getOrders(req, res, next) {
    const { page, row, status = "new" } = req.query;
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const count = await TranslationOrder.countDocuments({ status });
      const orders = await TranslationOrder.find({ status }, null, {
        limit,
        skip,
        sort: {
          createdAt: -1,
        },
      }).populate("userId", "name email image phone");
      if (!orders) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: orders, total: count });
    } catch (error) {
      console.log(error);
    }
  },
  async getOrderById(req, res, next) {
    const { id } = req.params;
    try {
      const order = await TranslationOrder.findById(id)
        .sort({ createdAt: -1 })
        .populate("userId", "name email image phone");
      if (!order) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: order });
    } catch (error) {
      return next(customErrorHandler.serverError());
    }
  },
  async getOrdersofUser(req, res, next) {
    const { id } = req.params;
    const { page, row } = req.query;
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);

    try {
      const count = await TranslationOrder.countDocuments({ userId: id });
      const order = await TranslationOrder.find({ userId: id }, "-__v", {
        limit,
        skip,
        sort: { createdAt: -1 },
      }).populate("userId", "name email image phone");
      if (!order || !count) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: order, total: count });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
  async getOrdersofUserSearch(req, res, next) {
    const { id } = req.params;
    const { page, row, service, country, translation, deadline } = req.query;
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);
    const sub = service
      ? { service_req: { $regex: service, $options: "i" } }
      : {};
    const con = country ? { country: { $regex: country, $options: "i" } } : {};
    const ids = translation
      ? { translationId: { $regex: translation, $options: "i" } }
      : {};
    const dead = deadline ? { deadline: new Date(deadline) } : {};
    try {
      const count = await TranslationOrder.countDocuments({
        $and: [{ userId: id }, con, sub, ids, dead],
      });
      const order = await TranslationOrder.find(
        { $and: [{ userId: id }, con, sub, ids, dead] },
        "-__v",
        {
          limit,
          skip,
          sort: { createdAt: -1 },
        }
      ).populate("userId", "name email image phone");
      if (!order || !count) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: order, total: count });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async getOrdersofAdimnSearch(req, res, next) {
    const { page, row, service, country, translation, deadline } = req.query;
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);
    const sub = service
      ? { service_req: { $regex: service, $options: "i" } }
      : {};
    const con = country ? { country: { $regex: country, $options: "i" } } : {};
    const ids = translation
      ? { translationId: { $regex: translation, $options: "i" } }
      : {};
    const dead = deadline ? { deadline: new Date(deadline) } : {};
    try {
      const count = await TranslationOrder.countDocuments({
        $and: [con, sub, ids, dead],
      });
      const order = await TranslationOrder.find(
        { $and: [con, sub, ids, dead] },
        "-__v",
        {
          limit,
          skip,
          sort: { createdAt: -1 },
        }
      ).populate("userId", "name email image phone");
      if (!order || !count) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: order, total: count });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async changeStatus(req, res, next) {
    const { id } = req.params;
    try {
      let { status, values, sender } = req.body;
      if (!values) {
        values = { subject: "", message: "" };
      }
      let notificationText;
      switch (status) {
        case "await":
          notificationText = "please confirm your order";
          break;
        case "process":
          notificationText = "your order in process";
          break;
        case "complete":
          notificationText = "your order has been complited";
          break;

        default:
          break;
      }
      const order = await TranslationOrder.findByIdAndUpdate(
        id,
        {
          ...(status && { status }),
        },
        { new: true, runValidators: true }
      ).populate("userId", "name email image phone");
      if (!order) {
        return next(customErrorHandler.emptyData("Could't updated"));
      }
      const notification = await Notification.create({
        notification: notificationText,
        type: "order",
        userId: order.userId._id,
        info: order,
      });

      io.sockets
        .in(order.userId._id.toString())
        .emit("notification", notification);

      if (values.subject || values.message) {
        io.sockets.in(order.userId._id.toString()).emit("orderMessage", {
          _id: order.userId._id,
          name: order.userId.name,
          text: values.message,
          orderId: order._id,
          order: order,
        });
        try {
          await Message.create(
            values.message,
            sender._id,
            sender.role,
            "",
            order.userId._id,
            order._id
          );
        } catch (err) {
          console.log(err);
        }
        await emailService.awaitEMail(order.userId, values);
      }
      res
        .status(201)
        .json({ message: "Order Status Change SuccessFully", data: order });
    } catch (e) {
      console.log(e);
      next(customErrorHandler.serverError(e));
    }
  },

  async getOrdersByAwait(req, res, next) {
    const { id } = req.params;
    const { page, row, wait, status } = req.query;
    const limit = +(row ? (row < 10 ? 10 : row) : 10);
    const skip = +(page < 0 ? 0 : limit * page);

    try {
      const order = await TranslationOrder.aggregate([
        {
          $lookup: {
            from: "messages",
            as: "lastMessage",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$id", "$orderId"]},
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
            ],
          },
        },
        { $unwind: "$lastMessage" },
        {
          $addFields: {
            await: {
              $cond: [
                {
                  $eq: ["$lastMessage.sender", mongoose.Types.ObjectId(id)],
                },
                "user",
                "admin",
              ],
            },
          },
        },
        {
          $match: {
            $and: [
              { status: status ? status: 'new' },
              { lastMessage: { $exists: true, $not: { $size: 0 } } },
              { await: wait ? wait : "user" },
            ],
          },
        },
        { $skip: skip },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "users",
            let: { idu: "$userId" },
            as: "userId",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$idu", "$_id"] },
                },
              },
              {
                $project:{
                  _id: 1,
                  name: 1,
                  email: 1,
                  image: 1,
                }
              },
            ],
          },
        },
        { $unwind: "$userId" },
        {
          $project: {
            _id: 1,
            userId: 1,
            translationId: 1,
            status: 1,
            files: 1,
            phone: 1,
            service_req: 1,
            sourceLanguage: 1,
            targetlanguage: 1,
            your_words: 1,
            certification: 1,
            await: 1,
            notarization: 1,
            deadline: 1,
            country: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $facet: {
            data: [{ $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ]);
      res.status(200).json({
        data: order[0].data,
        total: order[0].total[0] ? order[0].total[0].count : 0,
      });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async updateOrder(req, res, next) {
    const { id } = req.params;
    try {
      const {
        service_req,
        sourceLanguage,
        targetlanguage,
        your_words,
        certification,
        message,
        notarization,
        deadline,
        country,
        phone,
        status,
      } = req.body;

      const filesUrl = req.files.map((e) => e.path);
      const order = await TranslationOrder.findByIdAndUpdate(
        id,
        {
          ...(service_req && { service_req }),
          ...(sourceLanguage && { sourceLanguage }),
          ...(targetlanguage && { targetlanguage }),
          ...(your_words && { your_words }),
          ...(deadline && { deadline }),
          ...(certification && { certification }),
          ...(message && { message }),
          ...(country && { country }),
          ...(notarization && { notarization }),
          ...(status && { status }),
          ...(phone && { phone }),
          ...(filesUrl.length && { files: filesUrl }),
        },
        { new: true, runValidators: true }
      ).populate("userId", "name email image phone");
      if (!order) {
        return next(customErrorHandler.emptyData("Could't updated"));
      }
      res
        .status(201)
        .json({ message: "Order Updated SuccessFully", data: order });
    } catch (e) {
      console.log(e);
      next(customErrorHandler.serverError(e));
    }
  },
  async getChatsOrder(req, res, next) {
    const { id } = req.params;
    const { translation } = req.query;
    const fTrans = translation
      ? { translationId: { $regex: translation, $options: "i" } }
      : {};
    try {
      const data = await TranslationOrder.aggregate([
        {
          $lookup: {
            from: "messages",
            let: { id: "$_id" },
            as: "messages",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$id", "$orderId"] },
                      // { $eq: ["$seen", false] },
                      // { "$messages": { $exists: true, $ne: [] }}
                      {
                        $or: [
                          { $eq: ["$receiver", mongoose.Types.ObjectId(id)] },
                          { $eq: ["$sender", mongoose.Types.ObjectId(id)] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $match: {
            $and: [{ messages: { $exists: true, $not: { $size: 0 } } }, fTrans],
          },
        },
        {
          $addFields: {
            unseenMessages: {
              // $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: {
                  $and: [
                    { $eq: ["$$message.seen", false] },
                    {
                      $eq: ["$$message.receiver", mongoose.Types.ObjectId(id)],
                    },
                  ],
                },
              },
              // },
            },
          },
        },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            unseenMessages: 1,
            userId: 1,
            translationId: 1,
            status: 1,
            files: 1,
            phone: 1,
            service_req: 1,
            sourceLanguage: 1,
            targetlanguage: 1,
            your_words: 1,
            certification: 1,
            message: 1,
            notarization: 1,
            deadline: 1,
            country: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      if (!data) {
        return res.json({ data: "" });
      }
      res.status(200).json({ data });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
  async getUserChatsOrder(req, res, next) {
    const { id } = req.params;
    const { translation } = req.query;
    const fTrans = translation
      ? { translationId: { $regex: translation, $options: "i" } }
      : {};
    try {
      const data = await TranslationOrder.aggregate([
        {
          $lookup: {
            from: "messages",
            let: { id: "$_id" },
            as: "messages",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$id", "$orderId"] },
                      // { "$messages": { $exists: true, $ne: [] }}
                      {
                        $or: [
                          { $eq: ["$receiver", mongoose.Types.ObjectId(id)] },
                          { $eq: ["$sender", mongoose.Types.ObjectId(id)] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $match: {
            $and: [
              { messages: { $exists: true, $not: { $size: 0 } } },
              { userId: { $eq: mongoose.Types.ObjectId(id) } },
              fTrans,
            ],
          },
        },
        {
          $addFields: {
            unseenMessages: {
              // $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: {
                  $and: [
                    { $eq: ["$$message.seen", false] },
                    {
                      $eq: ["$$message.receiver", mongoose.Types.ObjectId(id)],
                    },
                  ],
                },
              },
              // },
            },
          },
        },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            unseenMessages: 1,
            userId: 1,
            translationId: 1,
            status: 1,
            files: 1,
            phone: 1,
            service_req: 1,
            sourceLanguage: 1,
            targetlanguage: 1,
            your_words: 1,
            certification: 1,
            message: 1,
            notarization: 1,
            deadline: 1,
            country: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      if (!data) {
        return res.json({ data: "" });
      }
      res.status(200).json({ data });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
};

export default translationController;
