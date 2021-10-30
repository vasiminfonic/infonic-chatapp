
import jwt from 'jsonwebtoken';
import joi from 'joi';
import { JWTSTRING } from '../../config';
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import fs from 'fs';

const loginController = {
    async register(req, res, next) {
        const { name, email, password} = req.body;
        const image = req.file.path;

        try {
            const { error } = joi.object({
                name: joi.string().required(),
                email: joi.string().email().required(),
                password: joi.string().required(),
                image: joi.string().allow()
            }).validate(req.body);
            if (error) {
                if (image) {
                    fs.unlink(`${appRoot}/${image}`, (err) => {
                        if (err) {
                            return next(
                                customErrorHandler.serverError(err.message)
                            );
                        }
                    });
                }
                return next(error);
            }
            const user = await User.create({ name, email, password, image})
            res.status(200).json({ message: 'Register Successfully', data: user });

        } catch (err) {
            if (image) {
                fs.unlink(`${appRoot}/${image}`, (err) => {
                    if (err) {
                        return next(
                            customErrorHandler.serverError(err.message)
                        );
                    }
                });
            }
            console.log(err);
            return next(customErrorHandler.serverError(err));
        }
    },
    async login(req, res, next) {
        const { email, password } = req.body;

        try {
            const { error } = joi.object({
                email: joi.string().email().required(),
                password: joi.string().required(),
            }).validate(req.body);
            if (error) {
                return next(error);
            }

            const user = await User.findOne({ email });
            if (!user) {
                return next(customErrorHandler.wrongCredentials('Wrong Email Please Try Other One'));
            } else {
                if (user.password !== password) {
                    return next(customErrorHandler.wrongCredentials('Wrong Password Please Try Other One'));
                }
            }
            const token = jwt.sign({
                data: { _id: user._id, role: user.role }
            }, JWTSTRING, { expiresIn: '1h' });
            res.status(200).json({ message: 'Logged In Successfully', token });

        } catch (err) {
            console.log(err)
            return next(customErrorHandler.serverError(err));
        }
    },

    async adminLogin(req, res, next) {
        const { email, password } = req.body;

        try {
            const { error } = joi.object({
                email: joi.string().email().required(),
                password: joi.string().required(),
            }).validate(req.body);
            if (error) {
                return next(error);
            }


            const user = await User.findOne({$and:[{email}, {role: 'admin'}] });
            if (!user) {
                return next(customErrorHandler.wrongCredentials('Wrong Email Please Try Other One'));
            } else {
                if (user.password !== password) {
                    return next(customErrorHandler.wrongCredentials('Wrong Password Please Try Other One'));
                }
            }
            const token = jwt.sign({
                data: { _id: user._id, role: user.role }
            }, JWTSTRING, { expiresIn: '1h' });
            res.status(200).json({ message: 'Logged In Successfully', token });

        } catch (err) {
            console.log(err)
            return next(customErrorHandler.serverError(err));
        }
    },


}
export default loginController  