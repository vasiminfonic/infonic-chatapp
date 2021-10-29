
import path from 'path';
import { customErrorHandler } from "../../errorHandler";
import Message from "../../models/message";
import User from '../../models/user';

const messageController = {
    async getMessages(req, res, next){
        const { sender, receiver } = req.query;
        
            try{
                if(!sender){
                    return next(customErrorHandler.wrongCredentials('sender is required'))
                }
                const message = await Message.find({$or: [{$and: [{sender}, {receiver}]}, {$and: [{sender: receiver}, {receiver: sender}]}]}).populate('sender', '-password -updatedAt -__v').sort({"createdAt": -1}).limit(10)
                if(!message){
                    return next(customErrorHandler.serverError("data is empty"))
                }
                res.status(200).json({data: message});
            }catch(err){
                console.log(err);
                return next(customErrorHandler.serverError());   
            }
        
        
    },
    async getAllMessages(req, res, next){
        try{
           const messages = await Message.find().sort({createdAt: 1}).populate('sender','name').map(ele=>{
               return ele.map(el=>{
               
                return({
                    _id: el._id,
                    message: el.message,
                    sender: el.sender
                })
               }
            )
           })
           if(!messages){
            return next(customErrorHandler.serverError())
           }
           res.status(200).json(messages)
        }catch(err){
          return next(customErrorHandler.serverError());
        }
    },
    async download(req, res, next){
        const { file } = req.params;
        try{
            const fileurl = path.join(__dirname, `../../uploads/${file}`)
           res.download(fileurl);
        }catch(err){
        
          return next(customErrorHandler.serverError());
        }
    },
    async getMessageUsers(req, res, next){
        try{
           const messages = await Message.find().distinct('sender');

           const data = await User.find({$and: [{_id: {$in: messages}}, {role: {$ne: 'admin'}}]}).populate('sender')
        res.status(200).json(data);

           
        }catch(err){
            console.log(err);
          return next(customErrorHandler.serverError());
        }
    },
    async setSeenMessage(req, res, next){
        const { id } = req.params
        try{
           const seen = await Message.updateMany({sender: id}, {$set:{seen: true}});
            if(!seen){
            return next(customErrorHandler.serverError())
           }
           res.status(200).json({message: 'done'});
        }catch(err){
            console.log(err)
          return next(customErrorHandler.serverError());
        }
    },
    async unseenMessage(req, res, next){
        const { id } = req.params;
        try{
           const seen = await Message.find({$and: [{sender:{$ne: id}}, {seen: false}]}).sort({createdAt: 1}).populate('sender',"_id name email");
            if(!seen){
            return next(customErrorHandler.serverError())
           }
           res.status(200).json({data: seen});
        }catch(err){
            console.log(err)
          return next(customErrorHandler.serverError());
        }
    },
    
}

export default messageController;