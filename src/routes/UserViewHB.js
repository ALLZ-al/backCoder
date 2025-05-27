import { Router } from "express";
import { passportCall, authorization } from "../utils.js";
const router = new Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/", passportCall("jwt"), authorization("user"), (req, res) => {
  res.render("profile", {
    user: req.user,
  });
});

export default router;
