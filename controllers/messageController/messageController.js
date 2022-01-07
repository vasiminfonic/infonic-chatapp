import path from "path";
import { customErrorHandler } from "../../errorHandler";
import Message from "../../models/message";
import User from "../../models/user";

const messageController = {
  async getMessages(req, res, next) {
    const { sender, receiver } = req.query;

    try {
      if (!sender) {
        return next(customErrorHandler.wrongCredentials("sender is required"));
      }
      const message = await Message.find({
        $or: [
          { $and: [{ sender }, { receiver }, { orderId: { $exists: false } }] },
          {
            $and: [
              { sender: receiver },
              { receiver: sender },
              { orderId: { $exists: false } },
            ],
          },
        ],
      })
        .populate("sender", "-password -updatedAt -__v")
        .sort({ createdAt: -1 })
        .limit(10);
      if (!message) {
        return next(customErrorHandler.serverError("data is empty"));
      }
      res.status(200).json({ data: message });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
  async getAllMessages(req, res, next) {
    try {
      const messages = await Message.find()
        .sort({ createdAt: 1 })
        .populate("sender", "name")
        .map((ele) => {
          return ele.map((el) => {
            return {
              _id: el._id,
              message: el.message,
              sender: el.sender,
            };
          });
        });
      if (!messages) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json(messages);
    } catch (err) {
      return next(customErrorHandler.serverError());
    }
  },
  async download(req, res, next) {
    const { file } = req.params;
    try {
      const fileurl = path.join(__dirname, `../../uploads/${file}`);
      res.download(fileurl);
    } catch (err) {
      return next(customErrorHandler.serverError());
    }
  },
  async getMessageUsers(req, res, next) {
    try {
      const messages = await Message.find().distinct("sender");

      const data = await User.find({
        $and: [{ _id: { $in: messages } }, { role: { $ne: "admin" } }],
      }).populate("sender");
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
  async setSeenMessage(req, res, next) {
    const { id } = req.params;
    try {
      const seen = await Message.updateMany(
        { sender: id },
        { $set: { seen: true } }
      );
      if (!seen) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ message: "done" });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
  async unseenMessage(req, res, next) {
    const { id } = req.params;
    try {
      const seen = await Message.find({
        $and: [{ sender: { $ne: id } }, { seen: false }],
      })
        .sort({ createdAt: 1 })
        .populate("sender", "_id name email");
      if (!seen) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ data: seen });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
  async unseenUserMessage(req, res, next) {
    const { id } = req.params;
    try {
      const seen = await Message.find({
        $and: [{ receiver: { $eq: id } }, { seen: false }],
      })
        .sort({ createdAt: 1 })
        .populate("sender", "_id name email");
      if (!seen) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ data: seen });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
  async getOrderMessages(req, res, next) {
    const { id } = req.params;
    try {
      const messages = await Message.find({ orderId: id }, "-__v -updatedAt")
        .populate("sender", "-password -updatedAt -__v")
        .sort({ createdAt: -1 })
        .limit(10);
      if (!messages) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ data: messages });
    } catch (err) {
      return next(customErrorHandler.serverError());
    }
  },
  async getOrderMessagesByDate(req, res, next) {
    let { id } = req.params;
    let {startDate, endDate, page, row} = req.query;
    const limit = +(row ? (row < 10 ? 10 : row) : 10);
    const skip = +(page < 0 ? 0 : limit * page);
   
    if (!startDate) {
      startDate = Date.now() - 1000 * 60 * 60 * 24;
    }
    if (!endDate) {
      endDate = Date.now();
    }
    try {
      const total = await Message.countDocuments({
        $and: [
          { receiver: { $eq: id } },
          {
            createdAt: {
              $gte: new Date(new Date(startDate).setHours(0)),
              $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
            },
          },
        ],
      });

      const messages = await Message.find(
        {
          $and: [
            { receiver: { $eq: id } },
            {
              createdAt: {
                $gte: new Date(new Date(startDate).setHours(0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
              },
            },
          ],
        },
        "-__v -updatedAt"
      )
        .populate({path: 'orderId', populate:{path: 'userId', select:'name email image'}})
        // .populate("sender", "name email image")
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        // .limit(10);
      if (!messages) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ data: messages, total });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },

  async setSeenOrderMessage(req, res, next) {
    const { id } = req.params;
    try {
      const seen = await Message.updateMany(
        { orderId: id },
        { $set: { seen: true } }
      );
      if (!seen) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ message: "done" });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
};

export default messageController;
