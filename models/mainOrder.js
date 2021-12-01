
import mongoose from 'mongoose';

import { SERVER_Path } from "../config";


 function genAssignId(){
    const d = new Date();
    return `GTH${d.getFullYear()}${d.getMonth()+1}${d.getDate()}test${Math.round(Math.random() * 10000)}`;
  }

const mainOrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      auto: true,
    },
    assignmentId: { type: String, required: false, default: genAssignId() },
    websiteId:{type: String, required: false},
    education: { type: String, required: true },
    paperLength: { type: String, required: true },
    paperType: { type: String, required: true },
    phone: { type: String, required: false },
    referencing: { type: String, required: true },
    subject: { type: String, required: true },
    question: { type: String, required: false },
    deadline: { type: Date, required: true },
    status:{type: String, required: false, default: 'Requested'},
    country: { type: String, required: true },
    files: [{ type: String, get: (image) => `${SERVER_Path}/${image}` }],
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
); 
//GTH2021110280
// mainOrderSchema.methods = {
//   genAssignId: function (){
//     const d = new Date();
//     return `GTH${d.getFullYear}${d.getMonth+1}${d.getDate()}${this._id.substr()}`;
//   }

// }

//  async function getNextSequence(name) {
//   var ret = await MainOrderModel.findByIdAndUpdate(
//     { _id: name },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   return ret.seq;
// }

// mainOrderSchema.pre('save',function(next){
//   var doc = this;
//   doc.assignmentId = getNextSequence('assignmentId')
//   // doc.findByIdAndUpdate(
//   //   { _id: "assignmentId" },
//   //   { $inc: { seq: 1 } },
//   //   function (error, counter) {
//   //     if (error) return next(error);
//   //     doc.assignmentId = counter.seq;
//       next();
//     // }
//   // );
// })

var MainOrderModel = mongoose.model('MainOrder',mainOrderSchema,'mainOrders');

// mainOrderSchema.pre("save", function (next) {
//   var doc = this;
//   MainOrderModel.findByIdAndUpdateAsync(
//     { _id: "entityId" },
//     { $inc: { assignmentId: 1 } },
//     { new: true, upsert: true }
//   )
//     .then(function (count) {
//       console.log("...count: " + JSON.stringify(count));
//       doc.assignmentId = count.seq;
//       next();
//     })
//     .catch(function (error) {
//       console.error("counter error-> : " + error);
//       throw error;
//     });
// });



export default MainOrderModel