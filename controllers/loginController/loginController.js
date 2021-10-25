
import jwt from 'jsonwebtoken';
import joi from 'joi';
import { JWTSTRING } from '../../config';
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";

const loginController = {
    async register (req,res,next){
        const { name, email, password } = req.body;
        
        try {
            const { error } = joi.object({
                name: joi.string().required(),
                email: joi.string().email().required(),
                password: joi.string().required(),
            }).validate(req.body);
            if(error){
                return next(error);
            }
            const user = await User.create({name, email, password})
            res.status(200).json({message: 'Register Successfully', data: user});
            
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }
    },
    async login (req,res,next){
        const { email, password } = req.body;

        try {
            const { error } = joi.object({
                email: joi.string().email().required(),
                password: joi.string().required(),
            }).validate(req.body);
            if(error){
                return next(error);
            }

            
            
        const user = await User.findOne({ email });
        if(!user){
            return next(customErrorHandler.wrongCredentials('Wrong Email Please Try Other One'));
        }else{
            if(user.password !== password){
                return next(customErrorHandler.wrongCredentials('Wrong Password Please Try Other One'));
                
            
        }
    }
    const token = jwt.sign({
        data: {_id: user._id, role: user.role}
      }, JWTSTRING, { expiresIn: '1h' });
    res.status(200).json({message: 'Logged In Successfully',token});
        
    } catch (err) {
        console.log(err)
        return next(customErrorHandler.serverError(err));
    }
    },
    async getUser (req,res,next){
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1]
    
        try {
            const { data: {_id}={} } = jwt.verify(token, JWTSTRING)
            console.log(_id);
            const user = await User.findOne({ _id },'-password -updatedAt -__v ');
            if(!user){
                return next(customErrorHandler.wrongCredentials())
            }
            res.status(200).json({data: user});
        } catch (err) {
            return next(customErrorHandler.serverError(err));
        }
    },
}
export default loginController  