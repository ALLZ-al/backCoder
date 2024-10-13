import express from "express";
import ProductManager from "../managers/ProductManager.js";
const router = express.Router();

const manager = new ProductManager("./src/data/products.json");

router.get("/", async (req, res) => {
  try {
    const products = await manager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/:pid", async (req, res) => {
  const productId = parseInt(req.params.pid);
  try {
    const product = await manager.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", (req, res) => {
  try {
    const newProduct = manager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  const productId = parseInt(req.params.pid);
  const updatedProduct = req.body;
  try {
    const result = await manager.updateProduct(productId, updatedProduct);
    if (result === "Producto no encontrado") {
      return res.status(404).send(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  const productId = parseInt(req.params.pid);
  try {
    const result = await manager.deleteProduct(productId);
    if (result === "Producto no encontrado") {
      return res.status(404).send(result);
    }
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
