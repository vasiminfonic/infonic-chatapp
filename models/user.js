import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, require: true, index: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    role: {type: String, default: 'user'}
},{timestamps: true});

userSchema.statics.email = (_id) => {
    const user = User.findOne({_id},'email');
    return user;
}
const User = mongoose.model('User',userSchema,'users');
export default User;