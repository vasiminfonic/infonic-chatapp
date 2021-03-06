import jwt from "jsonwebtoken";
import joi from "joi";
import { JWTSTRING, SERVER_Path } from "../../config";
import { customErrorHandler } from "../../errorHandler";
import User from "../../models/user";
import fs from "fs";
import UserDto from "../../dtos/userDto";

const userController = {
  async getSingleUser(req, res, next) {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return next(
          customErrorHandler.serverError("there is now any user with this id")
        );
      }
      res
        .status(200)
        .json({ message: "user is there", data: new UserDto(user) });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },

  async editUser(req, res, next) {

    const { id } = req.params;
     const { name, email, password, country, role, phone } = req.body;
     let image;
     if (req.file) {
       image = req.file.path;
     }
     // console.log(req.file, 'image')

     try {
       const { error } = joi
         .object({
           _id: joi.allow(),
           createdAt:joi.allow(),
           name: joi.string().allow(),
           email: joi.string().email().allow(),
           country: joi.string().allow(),
           phone: joi.string().allow(),
           password: joi.string().allow(),
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
       const user = await User.findByIdAndUpdate(
         id,
         {
           ...(name && { name }),
           ...(email && { email }),
           ...(password && { password }),
           ...(image && { image }),
           ...(country && { country }),
           ...(role && { role }),
           ...(phone && { phone }),
         },
         { new: true }
       );
       res.status(200).json({ message: "Updata Successfully", data: new UserDto(user) });
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

  async getUsers(req, res, next) {
    const { page, row, user } = req.query;
    const filter = user ? { role: { $eq: user } } : { role: { $eq: "user" } };
    const limit = +(row ? (row < 10 ? 10 : row) : 10);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const total = await User.countDocuments(filter);
      if (!total) {
        return next(customErrorHandler.wrongCredentials());
      }
      const users = await User.find(filter, "-password -updatedAt -__v ", {
        limit,
        skip,
        sort: { createdAt: -1 },
      });
      if (!users) {
        return next(customErrorHandler.wrongCredentials());
      }
      res.status(200).json({ data: users, total });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
  async getSubAdmin(req, res, next) {
    const { page, row } = req.query;
    const filter = { role: { $eq: "subAdmin" } };
    const limit = +(row ? (row < 10 ? 10 : row) : 10);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const total = await User.countDocuments(filter);
      if (!total) {
        return next(customErrorHandler.wrongCredentials());
      }
     
      const users = await User.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "assignOrders",
            localField: "_id",
            foreignField: "userId",
            as: "orders",
          },
        },
        // { $unwind: "$orders" },
        {
          $addFields: {
            orders: { $size: "$orders.orders" },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            image: 1,
            country: 1,
            phone: 1,
            orders: 1,
            createdAt: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
      ]);
      if (!users) {
        return next(customErrorHandler.wrongCredentials());
      }
      res.status(200).json({ data: users, total });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async getUsersWithOrder(req, res, next) {
    const { page, row, user } = req.query;
    const filter = user ? { role: { $eq: user } } : { role: { $ne: "admin" } };
    const limit = +(row ? (row < 5 ? 5 : row) : 5);
    const skip = +(page < 0 ? 0 : limit * page);
    try {
      const total = await User.countDocuments(filter);
      if (!total) {
        return next(customErrorHandler.wrongCredentials());
      }
      const users = await User.aggregate([
        { $match: filter },

        {
          $lookup: {
            from: "translationOrders",
            localField: "_id",
            foreignField: "userId",
            as: "orders",
          },
        },
        {
          $addFields: {
            orders: { $size: "$orders" },
            image: { $concat: [SERVER_Path, "/", "$image"] },
          },
        },

        {
          $project: {
            name: 1,
            email: 1,
            image: 1,
            country: 1,
            phone: 1,
            orders: 1,
            createdAt: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      if (!users) {
        return next(customErrorHandler.wrongCredentials());
      }
      res.status(200).json({ data: users, total });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },

  async getUser(req, res, next) {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(" ")[1];

      try {
        const { data: { _id } = {} } = jwt.verify(token, JWTSTRING);
        console.log(_id);
        if (!_id) {
          return next(customErrorHandler.serverError());
        }
        const user = await User.findOne({ _id }, "-password -updatedAt -__v ");
        if (!user) {
          return next(customErrorHandler.wrongCredentials());
        }
        res.status(200).json({ data: user });
      } catch (err) {
        return next(customErrorHandler.serverError(err));
      }
    }
  },

  async getAdmin(req, res, next) {
    try {
      const admin = await User.findOne(
        { role: "admin" },
        "-password -updatedAt -__v "
      );
      if (!admin) {
        return next(customErrorHandler.wrongCredentials());
      }
      res.status(200).json({ data: admin });
    } catch (err) {
      return next(customErrorHandler.serverError(err));
    }
  },

  async getUserSearch(req, res, next) {
    const { search } = req.params;
    try {
      const data = await User.find(
        {
          $and: [
            { name: { $regex: search, $options: "i" } },
            { role: { $ne: "admin" } },
          ],
        },
        "-password -updatedAt -__v "
      );
      if (!data) {
        return next(customErrorHandler.wrongCredentials());
      }
      res.status(200).json({ data });
    } catch (err) {
      return next(customErrorHandler.serverError(err));
    }
  },
  async getUserMessages(req, res, next) {
    const { id } = req.params;
    try {
      // const data = await User.find()
      const userMessage = await User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        {
          $lookup: {
            from: "messages",
            // localField: '_id',
            // foreignField: 'sender',
            let: { id: "$_id", img: "$image" },
            as: "messages",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$seen", false] },
                      { $eq: ["$$id", "$sender"] },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          $addFields: {
            unseenMessages: { $size: "$messages" },
            image: { $concat: [SERVER_Path, "/", "$image"] },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            unseenMessages: 1,
            image: 1,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            unseenMessages: 1,
            image: 1,
          },
        },
      ]);
      if (!userMessage) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ data: userMessage });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError(err));
    }
  },
  async updateUser(req, res, next) {
    const { id } = req.params;
    const { name, password, phone, country } = req.body;
    let image;
    if (req.file) {
      image = req.file.path;
    }

    try {
      const { error } = joi
        .object({
          name: joi.string().allow(null, ""),
          phone: joi.string().allow(null, ""),
          country: joi.string().allow(null, ""),
          password: joi.string().allow(null, ""),
          image: joi.string().allow(null, ""),
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
      if (!id) {
        if (image) {
          fs.unlink(`${appRoot}/${image}`, (err) => {
            if (err) {
              return next(customErrorHandler.serverError(err.message));
            }
          });
        }
        return next(customErrorHandler.wrongCredentials());
      }
      const user = await User.findByIdAndUpdate(
        id,
        {
          ...(name && { name }),
          ...(image && { image }),
          ...(country && { country }),
          ...(phone && { phone }),
          ...(password && { password }),
        },
        { new: true, runValidators: true }
      ).select("name email country phone image");
      if (!user) {
        return next(customErrorHandler.emptyData());
      }
      res.status(200).json({ message: "Updated Successfully", data: user });
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
  async deleteUser(req, res, next) {
    const { id } = req.params;
    try {
      const del = await User.findByIdAndDelete(id).select(
        "name email image password"
      );
      if (!del) {
        return next(customErrorHandler.serverError());
      }
      res.status(200).json({ message: "user has been deleted", data: del });
    } catch (err) {
      console.log(err);
      return next(customErrorHandler.serverError());
    }
  },
};

export default userController;
