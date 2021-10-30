
import jwt from 'jsonwebtoken';
import joi from 'joi';
import { JWTSTRING, SERVER_Path } from '../../config';
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";

const userController = {
    async getUser(req, res, next) {
        const { authorization } = req.headers;
        if(authorization){
            const token = authorization.split(' ')[1]

        try {
            const { data: { _id } = {} } = jwt.verify(token, JWTSTRING)
            console.log(_id);
            const user = await User.findOne({ _id }, '-password -updatedAt -__v ');
            if (!user) {
                return next(customErrorHandler.wrongCredentials())
            }
            res.status(200).json({ data: user });
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }

        }
        
    },

    async getAdmin(req, res, next) {
        try {
            const admin = await User.findOne({ role: 'admin' }, '-password -updatedAt -__v ');
            if (!admin) {
                return next(customErrorHandler.wrongCredentials())
            }
            res.status(200).json({ data: admin });
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }
    },

    async getUserSearch(req, res, next) {
        const { search } = req.params
        try {
            const data = await User.find({ $and: [{ name: { $regex: search, $options: "i" } }, { role: { $ne: 'admin' } }] }, '-password -updatedAt -__v ');
            if (!data) {
                return next(customErrorHandler.wrongCredentials());
            }
            res.status(200).json({ data });
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }
    },
    async getUserMessages(req, res, next) {
        const { id } = req.params;
        try {
            // const data = await User.find()
            const userMessage = await User.aggregate([
                { $match: { role: {$ne: 'admin'}}},
                {
                    $lookup: {
                        from: 'messages',
                        // localField: '_id',
                        // foreignField: 'sender',
                        let: {id: '$_id', img: '$image'},
                        as: 'messages',
                        pipeline: [
                            {
                                 $match: {
                                      $expr:{
                                           $and:[
                                                {$eq: ["$seen",false]},
                                                {$eq: ['$$id', '$sender']}
                                           ]
                                      }
        
                                 },
                            }
                       ]
                        
                    }
                },
                {
                    $addFields: {
                        "unseenMessages": { $size: "$messages" },
                        'image': {$concat: [SERVER_Path,'/','$image']},
                    }
                },
                {
                    $project: {
                     _id: 1,
                     name: 1,
                     unseenMessages: 1,
                     image: 1
                    }
                 }

            ])
            if (!userMessage) {
                return next(customErrorHandler.emptyData());
            }
            res.status(200).json({ data:userMessage })

        } catch (err) {
            console.log(err);
            return next(customErrorHandler.serverError(err))
        }
    }

}

export default userController  