import mongoose from "mongoose";

const assignOrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    orders: [
      { 
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TranslationOrder",
          unique: true,
        },
        assignAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("AssignOrder", assignOrderSchema, "assignOrders");
