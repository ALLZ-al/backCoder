import mongoose from "mongoose";
import Paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: [String],
    required: false,
  },
});

productSchema.plugin(Paginate);

const productsModel = mongoose.model("Product", productSchema);
export default productsModel;
