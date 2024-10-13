import express from "express";
import CartManager from "../managers/CartManager.js";
const router = express.Router();

const cartManager = new CartManager("./src/data/carts.json");

router.get("/", (req, res) => {
  const carts = cartManager.loadCarts();
  if (!carts || carts.length === 0) {
    return res.status(404).json({ error: "No hay carritos" });
  }
  res.json(carts);
});

router.get("/:cid", (req, res) => {
  const cartId = parseInt(req.params.cid);
  const cart = cartManager.getCartById(cartId);
  if (cart === "Carrito no encontrado") {
    return res.status(404).json({ error: cart });
  }
  res.json(cart);
});

router.get("/:cid/product/:pid", (req, res) => {
  const cartId = parseInt(req.params.cid);
  const productId = parseInt(req.params.pid);

  const cart = cartManager.getCartById(cartId);

  if (cart === "Carrito no encontrado") {
    return res.status(404).json({ error: cart });
  }

  const productInCart = cart.products.find((p) => p.product === productId);

  if (!productInCart) {
    return res
      .status(404)
      .json({ error: "Producto no encontrado en el carrito" });
  }

  return res.json(productInCart);
});

router.post("/:cid/product/:pid", (req, res) => {
  const cartId = parseInt(req.params.cid);
  const productId = parseInt(req.params.pid);
  const result = cartManager.addProductToCart(cartId, productId);

  if (result === "Carrito no encontrado") {
    return res.status(404).json({ error: result });
  } else if (result === "Producto no encontrado") {
    return res.status(404).json({ error: result });
  }

  res.status(201).json(result);
});

router.post("/", (req, res) => {
  const newCart = cartManager.createCart();
  res.status(201).json(newCart);
});

export default router;
