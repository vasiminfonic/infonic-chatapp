import MainOrder from "../../models/mainOrder";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import crypto from 'crypto';
import console from "console";

const mainOrderController = {
    async addOrder(req, res, next) {
        try {
            const {
                name,
                email,
                paperType,
                paperLength,
                education,
                referencing,
                subject,
                question,
                deadline,
                country,
            } = req.body;
            let user;
            try {
                user = await User.findOne({ email })
                if (!user) {
                    const password = crypto.randomBytes(5).toString('hex');
                    user = await User.create({
                        name,
                        email,
                        password
                    })
                }
            } catch (err) {
                console.log(err);
                return next(customErrorHandler.serverError())
            }
            const filesUrl = req.files.map(e => e.path)
            const order = await MainOrder.create({
                userId: user._id,
                paperType,
                paperLength,
                education,
                referencing,
                subject,
                question,
                deadline,
                country,
                ...(filesUrl.length && { files: filesUrl })
            })
            if (!order) {
                return next(customErrorHandler.emptyData())
            }
            res.status(200).json({ message: 'Order Created SuccessFully', data: order })
        } catch (e) {
            next(customErrorHandler.serverError(e))
        }

    },
    async getOrders(req, res, next) {
        try {
            const orders = await MainOrder.find({}, null, {
                limit: 10,
                sort: {
                    createdAt: -1
                }
            }).populate('userId', 'name email')
            if (!orders) {
                return next(customErrorHandler.emptyData());
            }
            res.status(200).json({ data: orders })
        } catch (error) {
            console.log(error);
        }
    },
    async getOrderById(req, res, next) {
        const { id } = req.params
        try {
            const order = await MainOrder.findById(id).populate('userId', 'name email')
            if (!order) {
                return next(customErrorHandler.emptyData());
            }
            res.status(200).json({ data: order })
        } catch (error) {
            return next(customErrorHandler.serverError())
         
        }
    },
    async getOrdersofUser(req, res, next) {
        const { id } = req.params;
        const { page, row } = req.query;
        const limit = +(row ? (row < 5 ? 5 : row) : 5);
        const skip = +(page < 0 ? 0 : (limit * page));
        
        try {
            const count = await MainOrder.countDocuments({userId: id});
            const order = await MainOrder.find({userId: id},'-__v',{ limit, skip})
            if (!order || !count) {
                return next(customErrorHandler.emptyData());
            }
            res.status(200).json({ data: order , total: count})
        } catch (err) {
            console.log(err)
            return next(customErrorHandler.serverError(err));
         
        }
    }
}
export default mainOrderController