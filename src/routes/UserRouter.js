import { Router } from "express";
import userModel from "../dao/models/UserModel.js";
import { createHash } from "../utils.js";
import cartModel from "../dao/models/CartModel.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await userModel.find();
    console.log(users);
    res.send({
      status: "success",
      payload: users,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;

  if (!first_name || !last_name || !email || !age || !password || !role) {
    return res.status(400).send({
      status: "error",
      message: "Todos los campos son obligatorios.",
    });
  }
  try {
    const existUser = await userModel.findOne({ email: email });
    if (existUser) {
      return res.status(409).send({
        status: "error",
        message: "Ya existe un usuario registrado con este email.",
      });
    }
    const hashedPassword = createHash(password);
    const newCart = await cartModel.create({});
    const user = await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: role || "user",
      cart: newCart._id,
    });
    res.status(201).send({
      result: "Success",
      payload: user._id,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    if (!user) throw new Error("User not found");

    const newUser = {
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      email: email ?? user.email,
      age: age ?? user.age,
      password: password ?? user.password,
      role: role ?? user.role,
    };

    const updateUser = await userModel.updateOne(
      { _id: req.params.id },
      newUser
    );
    res.send({
      status: "success",
      payload: updateUser,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await userModel.deleteOne({ _id: req.params.id });
    res.status(200).send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
