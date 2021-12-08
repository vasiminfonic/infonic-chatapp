import mongoose from "mongoose";
import { SERVER_Path } from "../config";
import AutoIncrement from "./autoIncrement";

const translationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      auto: true,
    },
    translationId: { type: String, required: false, },
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

translationSchema.pre("save", function (next) {
  const data = this;
    AutoIncrement.findOneAndUpdate(
      { name: "translationOrders" },
      { $inc: { counter: 1 } },
      { upsert: true },
      function (e, r) {
        if (e) {
          return next(e);
        }
        const count = r.counter.toString();
        const d = new Date();
        const Id = `STS${d.getFullYear()}${
          d.getMonth() + 1
        }${d.getDate()}${count.padStart(4, 0)}`

        data.translationId = Id;
        next();
      }
    );
});

translationSchema.methods.genAssignId = function(count){
  
    return ;
}
  // STS20200316184;

var translationModel = mongoose.model(
  "TranslationOrder",
  translationSchema,
  "translationOrders"
);

export default translationModel;
