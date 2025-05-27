import passport from "passport";
import passportLocal from "passport-local";
import jwtStrategy from "passport-jwt";
import userModel from "../dao/models/UserModel.js";
import { PRIVATE_KEY, createHash} from "../utils.js";
import cartModel from "../dao/models/CartModel.js";

const localStrategy = passportLocal.Strategy;

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
  passport.use(
    "register",
    new localStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        console.log("Registrando usuario:");
        console.log(req.body);

        try {
          const userExists = await userModel.findOne({ email });
          if (userExists) {
            console.log("El usuario ya existe.");
            return done(null, false);
          }
          const newCart = await cartModel.create({});
          let newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: "user",
            cart: newCart._id,
          };
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("Error registrando el usuario: " + error);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        console.log("Entrando a passport Strategy con JWT.");
        try {
          console.log("JWT obtenido del Payload");
          console.log(jwt_payload);

          return done(null, jwt_payload.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Error deserializando el usuario: " + error);
    }
  });
};

const cookieExtractor = (req) => {
  let token = null;

  console.log("Entrando a Cookie Extractor");

  if (req && req.cookies) {
    console.log("Cookies presentes: ");
    console.log(req.cookies);

    token = req.cookies["jwtCookieToken"];
    console.log("Token obtenido desde Cookie:");
    console.log(token);
  }
  return token;
};

export default initializePassport;
