import mongoose from 'mongoose'
import { SERVER_Path } from '../config';



const messageSchema = mongoose.Schema({
    message:String,
    type:{type: String, default:'user'},
    file: [{type:String, get: (file)=>`${SERVER_Path}${file}`}],
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    seen: {type: Boolean, default: false},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'}
}, {timestamps: true, toJSON: {getters: true}, id:false});


messageSchema.statics.create = (content, sender, type, file, receiver, order) => {
    let msg = new messageModal({
        message: content,
        type: type,
        sender: sender,
        receiver: receiver,
        ...(file && {file: file}),
        ...(order && {orderId: order})
    });
    return msg.save();
}
messageSchema.statics.latest = (count) => {
    return this.find({}).sort({"_id": "desc"}).limit(count);
};

const messageModal = mongoose.model("Message", messageSchema, 'messages');

export default messageModal;