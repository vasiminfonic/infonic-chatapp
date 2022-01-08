import mongoose from 'mongoose'
import { SERVER_Path } from '../config';
import Translation from '../models/tralationOrders';



const messageSchema = mongoose.Schema(
  {
    message: String,
    type: { type: String, default: "user" },
    file: [{ type: String, get: (file) => `${SERVER_Path}${file}` }],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "TranslationOrder" },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);


messageSchema.statics.create =async(content, sender, type, file, receiver, order) => {
    let msg = new messageModal({
        message: content,
        type: type,
        sender: sender,
        receiver: receiver,
        ...(file && {file: file}),
        ...(order && {orderId: order})
    });
    
    const isMessage = await messageModal.exists({ orderId: order })
    const saveMsg = msg.save();
    if (!isMessage){
      await Translation.findByIdAndUpdate(order, {status: 'await'});
    } 
    return saveMsg;
}

const messageModal = mongoose.model("Message", messageSchema, 'messages');

export default messageModal;