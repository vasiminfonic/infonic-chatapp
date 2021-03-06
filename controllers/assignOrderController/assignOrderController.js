import AssignOrder from "../../models/assignOrder";
import { customErrorHandler } from "../../errorHandler";

const assignOrderControll = {
  async assign(req, res, next) {
    const { user, order } = req.body;
    try {
      const assignData = await AssignOrder.findOneAndUpdate(
        { userId: user._id, 'orders.order': {$ne: order._id}},
        {$addToSet: {orders: {order: order._id }}},
        { runValidators: true, upsert: true}
      );
      if (!assignData) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({message: 'order assigned'});
    } catch (errr) {
      console.log(errr);
    }
  },
  async getAssignOrder(req, res, next){
    const { userId } = req.params;
     const { page, row } = req.query;
     const limit = +(row ? (row < 10 ? 10 : row) : 10);
     const skip = +(page < 0 ? 0 : limit * page);
    const assignOrder = await AssignOrder.findOne({ userId }).populate({
      path: "orders",
      populate: {
        path: "order",
        model: "TranslationOrder",
        options: {
       
          skip,
          limit,
          populate:{
            path: 'userId'
          }
        },
      },
    });
    if(!assignOrder){
      next(customErrorHandler.emptyData())
    }
    res.status(200).json({data: assignOrder.orders, total: assignOrder.orders.length});
  }
};
export default assignOrderControll;
