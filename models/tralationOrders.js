import mongoose from "mongoose";

import { SERVER_Path } from "../config";

function genAssignId() {
  const d = new Date();
  return `GTH${d.getFullYear()}${
    d.getMonth() + 1
  }${d.getDate()}TRANS${Math.round(Math.random() * 10000)}`;
}

const translationSchema = mongoose.Schema(
  {
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      auto: true,
    },
    translationId: { type: String, required: false, default: genAssignId() },
    websiteId: { type: String, required: false },
    service_req: { type: String, required: true },
    sourceLanguage: { type: String, required: true },
    targetlanguage: { type: String, required: true },
    phone: { type: String, required: false },
    country: { type: String, required: true },
    deadline: { type: Date, required: true },
    your_words: { type: String, required: true },
    certification: { type: String, required: true },
    message: { type: String, required: false },
    notarization: { type: String, required: false },
    status: { type: String, required: false, default: "Requested" },
    files: [{ type: String, get: (image) => `${SERVER_Path}/${image}` }],
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);
var translationModel = mongoose.model("TranslationOrder", translationSchema, "translationOrders");

export default translationModel;
