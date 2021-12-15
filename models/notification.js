import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notification: {type: String, require: false},
    type: { type:String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required:true, index: true },
    seen: {type: Boolean, default: false},
    info:{type: Object, required: true },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);


const Notification = mongoose.model("Notification", notificationSchema, "notifications");
export default Notification;
