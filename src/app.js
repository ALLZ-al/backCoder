import express from "express";
import { engine } from "express-handlebars";
import __dirname from "./utils.js";
import productRouter from "./routes/ProductRouter.js";
import cartRouter from "./routes/CartRouter.js";
import { join } from "path";
import { router as ViewsRouter } from "./routes/ViewsRouter.js";
import { Server } from "socket.io";
import ProductManager from "./managers/ProductManager.js"; 

const app = express();
const port = 8080;

const productManager = new ProductManager("./src/data/products.json");

app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use(express.static(join(__dirname, "public")));

app.engine("handlebars", engine());
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
      const products = await productManager.getProducts();
      socket.emit("newProduct", products); 
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    }
  });

  socket.on("addProduct", async (newProduct) => {
    try {
      const existingProducts = await productManager.getProducts();
      
      const isDuplicateCode = existingProducts.some(product => product.code === newProduct.code);

      if (isDuplicateCode) {
        socket.emit("productError", { message: `El código "${newProduct.code}" ya está en uso. Por favor, ingresa un código único.` });
      } else {
        await productManager.addProduct(newProduct);
        const products = await productManager.getProducts();
        io.emit("newProduct", products);
      }
    } catch (error) {
      socket.emit("productError", { message: error.message });
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      const result = await productManager.deleteProduct(Number(productId));
      if (result === "Producto eliminado") {
        const products = await productManager.getProducts();
        io.emit("newProduct", products); 
      } else {
        console.log(result); 
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  });
});
