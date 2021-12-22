
import { JWTSTRING } from '../config';
import { customErrorHandler } from '../errorHandler';
import jwt from 'jsonwebtoken';

const authMiddleware = {
    async checkAuth(req, res, next){
        const { authorization } = req.headers;
        if(!authorization) return res.status(404).end()
          const reqtoken = authorization.split(" ")[1];
          if (!reqtoken) return res.status(404).end();

          try {
            const { data: { _id } = {} } = await jwt.verify(reqtoken, JWTSTRING);
            if (!_id) {
              return next(customErrorHandler.serverError("invalid token"));
            }
          return next();
          } catch (err) {
            return next(customErrorHandler.serverError(err));
          }
    },
    async adminCheckAuth(req, res, next){
        const { authorization } = req.headers;
        if(!authorization) return res.status(404).end()
          const reqtoken = authorization.split(" ")[1];
          if(!reqtoken) return res.status(404).end();
          try {
            const { data: { _id } = {} } = await jwt.verify(reqtoken, JWTSTRING);
            if (!_id) {
              return next(customErrorHandler.wrongCredentials('Un Authorize'));
            }
          return next();
          } catch (err) {
            return next(customErrorHandler.serverError(err));
          }
    }
}
export default authMiddleware