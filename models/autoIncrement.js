import mongoose from "mongoose";

const autoIncementSchema = mongoose.Schema({
  name: { type: String, required: true, index: true },
  counter: { type: Number, default: 0 },
});

export default mongoose.model("AutoIncrement", autoIncementSchema, "autoIncrements");
