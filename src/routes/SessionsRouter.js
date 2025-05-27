import { Router } from "express";
import userModel from "../dao/models/UserModel.js";
import {
  isValidPassword,
  generateJWToken,
  passportCall,
} from "../utils.js";
import passport from "passport";

const router = Router();

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/fail-register",
  }),
  async (req, res) => {
    res.send({
      status: "success",
      message: "Usuario creado con exito con ID: ",
    });
  }
);

router.post("/login", async (req, res) => {
  console.log("req.body recibido en /api/sessions/login:", req.body);
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    console.log("Usuario encontrado para login:");
    console.log(user);
    if (!user) {
      console.warn("User doesn't exists with username: " + email);
      return res
        .status(204)
        .send({
          error: "Not found",
          message: "Usuario no encontrado con username: " + email,
        });
    }

    if (!isValidPassword(user, password)) {
      console.warn("Invalid credentials for user: " + email);
      return res
        .status(401)
        .send({
          status: "error",
          error: "El usuario y la contraseña no coinciden",
        });
    }

    const tokenUser = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      role: user.role,
      cartId: user.cart,
    };
    const access_token = generateJWToken(tokenUser);
    console.log(access_token);

    res.cookie("jwtCookieToken", access_token, {
      maxAge: 60000,
      httpOnly: true,
    });

    res.send({
      status: "Login success",
      message: "Login Successful !",
      userCartId: user.cart,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/current", passportCall("jwt"), (req, res) => {
  console.log("Datos del usuario en req.user para /current:", req.user);
  if (!req.user) {
    return res
      .status(401)
      .send({
        status: "error",
        message: "No autenticado. Usuario no encontrado en el token.",
      });
  }
  res.status(200).json({ status: "success", payload: req.user });
});

router.get("/fail-register", (req, res) => {
  res.status(401).send({ error: "Failed to process register" });
});

router.get("/fail-login", (req, res) => {
  res.status(401).send({ error: "Failed to process login" });
});

export default router;
