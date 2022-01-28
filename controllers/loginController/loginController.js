import jwt from "jsonwebtoken";
import joi from "joi";
import { JWTSTRING, OTP_SECRET } from "../../config";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import fs from "fs";
import UserDto from "../../dtos/userDto";
import crypto from "crypto";
import nodemailer from "nodemailer";

const loginController = {
  async register(req, res, next) {
    const { name, email, password, country, role, phone } = req.body;
    let image;
    if (req.file) {
      image = req.file.path;
    }
    // console.log(req.file, 'image')

    try {
      const { error } = joi
        .object({
          name: joi.string().required(),
          email: joi.string().email().required(),
          country: joi.string().allow(),
          phone: joi.string().allow(),
          password: joi.string().required(),
          image: joi.allow(),
          role: joi.string().allow(),
          confirmPassword: joi.allow(),
        })
        .validate(req.body);
      if (error) {
        if (image) {
          fs.unlink(`${appRoot}/${image}`, (err) => {
            if (err) {
              return next(customErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }
      const user = await User.create({
        name,
        email,
        password,
        ...(image && { image }),
        ...(country && { country }),
        ...(role && { role }),
        ...(phone && { phone }),
      });
      res.status(200).json({ message: "Register Successfully", data: user });
    } catch (err) {
      if (image) {
        fs.unlink(`${appRoot}/${image}`, (err) => {
          if (err) {
            return next(customErrorHandler.serverError(err.message));
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
      const { error } = joi
        .object({
          email: joi.string().email().required(),
          password: joi.string().required(),
        })
        .validate(req.body);
      if (error) {
        return next(error);
      }

      const user = await User.findOne({ email, role: { $ne: "admin" } });
      if (!user) {
        return next(
          customErrorHandler.wrongCredentials(
            "Wrong Email Please Try Other One"
          )
        );
      } else {
        if (user.password !== password) {
          return next(
            customErrorHandler.wrongCredentials(
              "Wrong Password Please Try Other One"
            )
          );
        }
      }
      const token = jwt.sign(
        {
          data: { _id: user._id, role: user.role },
        },
        JWTSTRING,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "Logged In Successfully",
        token,
        user: new UserDto(user),
      });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async adminLogin(req, res, next) {
    const { email, password } = req.body;

    try {
      const { error } = joi
        .object({
          email: joi.string().email().required(),
          password: joi.string().required(),
        })
        .validate(req.body);
      if (error) {
        return next(error);
      }

      const user = await User.findOne({
        $and: [
          { email },
          { $or: [{ role: { $eq: "admin" } }, { role: { $eq: "subAdmin" } }] },
        ],
      });
      if (!user) {
        return next(
          customErrorHandler.wrongCredentials(
            "Wrong Email Please Try Other One"
          )
        );
      } else {
        if (user.password !== password) {
          return next(
            customErrorHandler.wrongCredentials(
              "Wrong Password Please Try Other One"
            )
          );
        }
      }
      const token = jwt.sign(
        {
          data: { _id: user._id, role: user.role },
        },
        JWTSTRING,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "Logged In Successfully",
        token,
        user: new UserDto(user),
      });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
  async getRefresh(req, res, next) {
    const { authorization } = req.headers;
    if (authorization) {
      const reqtoken = authorization.split(" ")[1];

      try {
        const { data: { _id, role } = {} } = jwt.verify(reqtoken, JWTSTRING);
        console.log(_id);
        if (!_id) {
          return next(customErrorHandler.serverError("invalid token"));
        }
        const user = await User.findOne({ _id }, "-password -updatedAt -__v ");
        if (!user) {
          return next(customErrorHandler.wrongCredentials("token expired"));
        }
        const token = jwt.sign(
          {
            data: { _id: user._id, role: user.role },
          },
          JWTSTRING,
          { expiresIn: "1h" }
        );
        res
          .status(200)
          .json({ user: new UserDto(user), token, message: "Refreshed" });
      } catch (err) {
        return next(customErrorHandler.serverError(err));
      }
    }
  },
  async getFogotUser(req, res, next) {
    const { email } = req.body;
    console.log(email);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return next(customErrorHandler.wrongCredentials());
      }
      const otp = crypto.randomInt(1000, 9999);
      const ttl = 1000 * 60 * 2;
      const expires = Date.now() + ttl;

      const hash = crypto
        .createHmac("sha256", OTP_SECRET)
        .update(`${user.email}.${otp}.${expires}`)
        .digest("hex");

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "vasim.infonic@gmail.com", // generated ethereal user
          pass: "qiwpdofprhvkeevk", // generated ethereal password
        },
      });
      let info = await transporter.sendMail({
        from: "vasim.infonic@gmail.com", // sender address
        to: user.email, // list of receivers
        subject: "new OTP from infonic", // Subject line
        text: "this is confidencial otp", // plain text body
        html: `<p>Dont share it otp to anyone <br>
                keep it confidential the Otp is valit for only 2 minuts
                <br>Here is your otp ${otp}
                </p>`, // html body
      });
      res.status(200).json({ hash: `${hash}.${expires}`, email });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async verifyUserOtp(req, res, next) {
    const { email, hash, otp, password } = req.body;
    console.log(req.body);

    try {
      if (!email || !hash || !otp) {
        return next(customErrorHandler.wrongCredentials());
      }
      const [otpHash, expires] = hash.split(".");
      if (Date.now() > +expires) {
        return res.json({ message: "Otp Has Been Expired", updated: false });
      }
      const newHash = crypto
        .createHmac("sha256", OTP_SECRET)
        .update(`${email}.${otp}.${expires}`)
        .digest("hex");
      if (newHash !== otpHash) {
        return res.json({ message: "Invalid OTP", updated: false });
      }
      await User.updateOne({ email }, { $set: { password } });
      res.status(200).json({
        message: "Password has been change successfully",
        updated: true,
      });
    } catch (error) {
      return next(customErrorHandler.serverError());
    }
  },
};
export default loginController;
