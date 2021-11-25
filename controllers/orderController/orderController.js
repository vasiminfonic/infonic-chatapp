import path from 'path';
import fs from 'fs';
import Order from "../../models/orders";
import { customErrorHandler } from "../../errorHandler";


const orderController = {
   async postOrder(req, res, next){
        const { user, subject, education, question } = req.body;
        let filesArray;
        if(req.files){
         filesArray = req.files.map(e=>e.path);
        }
        try {
            const order = await Order.create({
                user, subject, education, question, ...(filesArray && {files: filesArray}) 
            })
            if(!order){
                if (filesArray) {
                    filesArray.forEach(element => {
                        fs.unlink(`${appRoot}/order/${element}`, (err) => {
                            if (err) {
                                return next(
                                    customErrorHandler.serverError(err.message)
                                );
                            }
                        });
                    });
                }
            return next(customErrorHandler.serverError())
            }
            res.status(200).json({data: order, message: 'Order Created SuccessFully'})
            
        } catch (err) {
            if (filesArray) {
                filesArray.forEach(element => {
                    fs.unlink(`${appRoot}/order/${element}`, (err) => {
                        if (err) {
                            return next(
                                customErrorHandler.serverError(err.message)
                            );
                        }
                    });
                });
            }
            console.log(err);
            return next(customErrorHandler.serverError(err))
        }
    },
    async getOrder(req, res, next){
        try {
            const orders = await Order.find({},'-updatedAt').populate('user','name email image' )
            if(!orders){
                return (next(customErrorHandler.serverError()))
            }
            res.status(200).json({data: orders})
        } catch (error) {
            return next(customErrorHandler.serverError())
            
        }
    },

    async getUserByOrder(req, res, next){
        const { id } = req.params
        try {
            const order = await Order.findOne({_id: id},'-updatedAt').populate('user','name email image' )
            if(!order){
                return (next(customErrorHandler.serverError()));
            }
            res.status(200).json({data: order})
        } catch (error) {
            return next(customErrorHandler.serverError());
        }
    },

    async getOrderSearch(req, res, next) {
        const { search } = req.params
        try {
            const data = await Order.find({ _id: { $regex: search, $options: "i" }}, '-password -updatedAt -__v ');
            if (!data) {
                return next(customErrorHandler.wrongCredentials());
            }
            res.status(200).json({ data });
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }
    },
    async getOrdersofUser(req, res, next){
        const { id } = req.params;
        const { page, row } = req.query;
        if(row <= 0 || page <= 0){
            row = 1;
            page = 0;
        }
        try {
            const count = await Order.countDocuments({user: id});
            const orders = await Order.find({user: id},'-updatedAt').populate('user','name email image' ).sort('createdAt').skip(+(row * page)).limit(row)
            if(!orders){
                return (next(customErrorHandler.serverError()));
            }
            res.status(200).json({data: orders, total: count })
        } catch (error) {
            return next(customErrorHandler.serverError());
        }
    },
    
}
export default orderController