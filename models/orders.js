import mongoose from "mongoose";

const orderSchema= mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    subject: {type: String, required: true},
    education:{ type: String, enum:
    ['secondary',
     'senior secondary',
     'graduation',
     'college',
     'university',
     'doctorate',
     'master'
    ], required: true},
    question: String,
    questions: String,
    files: [String]
}, { timestamps: true })

export default mongoose.model('Order', orderSchema, 'orders');