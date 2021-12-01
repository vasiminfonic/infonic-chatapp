import mongoose from "mongoose";
import { SERVER_Path } from "../config";

const notificationSchema = new mongoose.Schema(
  {
    type: { type:String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, required:true },
    seen: {type: Boolean, default: false},
    infoId:{type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);


const Notification = mongoose.model("Notification", notificationSchema, "notifications");
export default Notification;
