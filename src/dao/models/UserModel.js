import mongoose from "mongoose";

const userCollection = "users";

const userSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  age: Number,
  password: { type: String },
  role: {
    type: String,
    default: "user",
    rol: ["user", "admin"],
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
