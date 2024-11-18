import mongoose from "mongoose";
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, default: 0 },
});

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
