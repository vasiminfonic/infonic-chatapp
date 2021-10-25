import mongoose from 'mongoose'
import User from './user'


const messageSchema = mongoose.Schema({
    message:{type: String, require: true},
    type:{type: String, default:'user'},
    file: [String],
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    seen: {type: Boolean, default: false}
}, {timestamps: true})



messageSchema.statics.create = (content, sender, type, file, receiver) => {
    let msg = new messageModal({
        message: content,
        type: type,
        sender: sender,
        receiver: receiver,
        ...(file && {file: file})
    });
    return msg.save();
}
messageSchema.statics.latest = (count) => {
    return this.find({}).sort({"_id": "desc"}).limit(count);
};

const messageModal = mongoose.model("Message", messageSchema, 'messages');

export default messageModal;