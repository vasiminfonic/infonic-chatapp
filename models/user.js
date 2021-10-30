import mongoose from "mongoose";
import { SERVER_Path } from "../config";

const userSchema = new mongoose.Schema({
    name: {type: String, require: true, index: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    image: {type: String, get:(image)=>`${SERVER_Path}/${image}`},
    role: {type: String, default: 'user'}
},{timestamps: true, toJSON: {getters: true}, id:false});

userSchema.statics.email = (_id) => {
    const user = User.findOne({_id},'email');
    return user;
}
const User = mongoose.model('User',userSchema,'users');
export default User;