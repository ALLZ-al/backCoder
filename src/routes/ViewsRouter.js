import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

export const router = Router();

const productManager = new ProductManager("./src/data/products.json");

router.get('/products', async (req, res) => {
    try {
      const products = await productManager.getProducts();
      res.render("index", { products }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  });


router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});
