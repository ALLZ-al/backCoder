import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => {
  console.log(`Valida: user-password: ${user.password}, password: ${password}`);
  return bcrypt.compareSync(password, user.password);
};

export const PRIVATE_KEY =
  "$2a$12$/poEFA.C/sRPG67DiFhfguQq.AaIxkaJb5P/NCkSTGFtlyLPIrjYu";

export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "24h" });
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);

      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }

      console.log("Usuario obtenido del strategy: ");
      console.log(user);

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user)
      return res.status(401).send("Unauthorized: User not found in JWT");

    if (req.user.role !== role) {
      return res
        .status(403)
        .send("Forbidden: El usuario no tiene permisos con este rol.");
    }
    next();
  };
};

export default __dirname;
