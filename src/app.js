import express from "express";
import productRouter from "./routes/ProductRouter.js";
import cartRouter from "./routes/CartRouter.js";

const app = express();
const port = 8080;

app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
