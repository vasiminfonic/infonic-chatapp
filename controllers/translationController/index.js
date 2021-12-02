import TranslationOrder from "../../models/tralationOrders";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import crypto from "crypto";

const translationController = {
  async addOrder(req, res, next) {
    try {
      const {
        name,
        email,
        phone,
        country,
        websiteId,
        assignmentId,
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
      const order = await TranslationOrder.create({
        userId: user._id,
        phone,
        service_req,
        sourceLanguage,
        targetlanguage,
        your_words,
        certification,
        message,
        notarization,
        deadline,
        country,
        websiteId,
        assignmentId,
        status,
        ...(filesUrl.length && { files: filesUrl }),
      });
      if (!order) {
        return next(customErrorHandler.emptyData());
      }
      res
        .status(200)
        .json({ message: "Order Created SuccessFully", data: order });
    } catch (e) {
      console.log(e);
      next(customErrorHandler.serverError(e));
    }
  },
  async getOrders(req, res, next) {
    try {
      const orders = await TranslationOrder.find({}, null, {
        limit: 10,
        sort: {
          createdAt: -1,
        },
      }).populate("userId", "name email image");
      if (!orders) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: orders });
    } catch (error) {
      console.log(error);
    }
  },
  async getOrderById(req, res, next) {
    const { id } = req.params;
    try {
      const order = await TranslationOrder.findById(id).populate(
        "userId",
        "name email"
      );
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
      });
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
};
export default translationController;
