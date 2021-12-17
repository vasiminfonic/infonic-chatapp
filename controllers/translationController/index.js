import TranslationOrder from "../../models/tralationOrders";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import crypto from "crypto";
import mongoose from "mongoose";
import Notification from "../../models/notification";
import { SERVER_Path } from "../../config";


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
        status,
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
        status,
        ...(filesUrl.length && { files: filesUrl }),
      });
      if (!order) {
        return next(customErrorHandler.emptyData());
      }
      const userData = {
        _id: user._id,
        name: user.name,
        email:user.email,
        image: user.image ? user.image : '',
      }
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
        ...(order.files.length && { files: filesUrl.map(e=>`${SERVER_Path}/${e}`) }),
        translationId: order.translationId,
        userId: userData,
      };
      let admin;
      console.log(filesUrl, 'FilesUres');
      console.log(order.files, "FilesOrder");
      console.log(orderData.files, "FilesOrderMain");

      try {
        admin = await User.findOne({role: 'admin'},'-password -updatedAt -__v')
        if(!admin){
          return next(customErrorHandler.serverError('admin Not found'))
        }
      } catch (er) {
        console.log(er);
        return next(customErrorHandler.serverError())
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
      io.sockets.in(admin._id.toString()).emit("notification", notification[0]);
      io.sockets.in(user._id.toString()).emit("notification", notification[1]);
      } catch (err) {
         console.log(err);
         next(customErrorHandler.serverError(err));
      }
      res
        .status(200)
        .json({ message: "Order Created SuccessFully", data: orderData});
    } catch (e) {
      console.log(e);
      next(customErrorHandler.serverError(e));
    }
  },
  async getOrders(req, res, next) {
    const { page, row } = req.query;
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const count = await TranslationOrder.countDocuments({});
      const orders = await TranslationOrder.find({}, null, {
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
    const dead = deadline
      ? { deadline: new Date(deadline)}
      : {};
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

  async updateOrder(req, res, next) {
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
        req.params.id,
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
            $and: [{ messages: { $exists: true, $not: { $size: 0 } } },fTrans],
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
                    { $eq: ["$$message.receiver", mongoose.Types.ObjectId(id)]},
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
    const fTrans = translation ? {translationId: {$regex: translation, $options: 'i'}}: {};  
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
                      { $eq: ["$receiver", mongoose.Types.ObjectId(id)]},
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
                  $eq: ["$$message.seen", false],
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
