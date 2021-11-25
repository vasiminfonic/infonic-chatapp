
import mongoose from 'mongoose';
import { SERVER_Path } from "../config";


const mainOrderSchema = mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    education: {type: String, required: true},
    paperLength: {type: String, required: true},
    paperType: {type: String, required: true},
    referencing: {type: String, required: true},
    subject: {type: String, required: true},
    question: {type: String, required: true},
    deadline: {type: Date, required: true},
    country: {type: String, required: true},
    files: [{type: String, get:(image)=>`${SERVER_Path}/${image}`}],
},{ timestamps: true , toJSON: {getters: true}, id:false}) 

export default mongoose.model('MainOrder',mainOrderSchema,'mainOrders')