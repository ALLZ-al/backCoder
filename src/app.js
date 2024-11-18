import express from "express";
import __dirname from "./utils.js";
import productRouter from "./routes/ProductRouter.js";
import { cartRouter } from "./routes/CartRouter.js";
import { join } from "path";
import { router as ViewsRouter } from "./routes/ViewsRouter.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import Handlebars from "handlebars";
import cartModel from "./dao/models/CartModel.js";
import productsModel from "./dao/models/ProductModel.js";

const app = express();
const port = 8080;

app.use(express.json());

app.use("/api/products", productRouter);
app.use("/carts", cartRouter);
app.use(express.static(join(__dirname, "public")));

const hbs = engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("calculateTotal", function (items) {
  if (!Array.isArray(items)) {
    return 0;
  }
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

app.engine("handlebars", hbs);
app.set("view engine", "handlebars");
let rutaViews = join(__dirname, "views");
app.set("views", rutaViews);

app.use("/", ViewsRouter);

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Cliente conectado`);

  socket.on("getProducts", async () => {
    try {
      const products = await productsModel.find();
      socket.emit("newProduct", products);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    }
  });

  socket.on("addToCart", async (cartId, productId, quantity) => {
    try {
      const cart = await cartModel.findById(cartId);
      const product = await productsModel.findById(productId);

      const existingProduct = cart.products.find(
        (p) => p.product.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, p) => acc + p.quantity * p.product.price,
        0
      );
      await cart.save();

      socket.emit("cartUpdated", cart);
      io.emit("cartUpdated", cart);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  });

  socket.on("removeFromCart", async (cartId, productId) => {
    try {
      const cart = await cartModel.findById(cartId);
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex !== -1) {
        cart.products.splice(productIndex, 1);
        cart.totalPrice = cart.products.reduce(
          (acc, p) => acc + p.quantity * p.product.price,
          0
        );
        await cart.save();

        socket.emit("cartUpdated", cart);
        io.emit("cartUpdated", cart);
      } else {
        socket.emit("error", {
          message: "Producto no encontrado en el carrito.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error);
    }
  });
});

const conectarDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Allz:backCoder2024@backcoder.clgja.mongodb.net/?retryWrites=true&w=majority&appName=backCoder",
      {
        dbName: "ecommerce",
      }
    );
    console.log("DB Online...!!!");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

conectarDB();
