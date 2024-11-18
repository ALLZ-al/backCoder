import { Router } from "express";
import { CartMongoManager } from "../dao/CartMongoManager.js";
import { isValidObjectId } from "mongoose";
import { ProductMongoManager } from "../dao/ProductMongoManager.js";

const router = Router();

router.get("/:cid", async (req, res) => {
  let { cid } = req.params;

  if (!isValidObjectId(cid)) {
    return res.status(400).json({ error: "ID de carrito inválido" });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid).populate(
      "products.productId"
    );
    if (!cart) {
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(400).json({ error: `${error.message}` });
  }
});

router.post("/", async (req, res) => {
  try {
    let newCart = await CartMongoManager.createCart();
    res.setHeader("Content-Type", "application/json");
    res.status(201).json({ newCart });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `${error.message}` });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id invalido...` });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid).populate("products.productId");

    if (!cart) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }

    let product = await ProductMongoManager.getProductBy({ _id: pid });
    if (!product) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `No existe producto con id ${pid}` });
    }

    console.log(cart);
    let indexProduct = cart.products.findIndex(
      (p) => p.productId.toString() === pid
    );

    if (indexProduct === -1) {
      cart.products.push({
        productId: pid, 
        quantity: 1,
      });      
    } else {
      cart.products[indexProduct].quantity++;
    }

    let updatedCart = await CartMongoManager.updateCart(cid, cart);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ updatedCart });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `${error.message}` });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid);
    if (!cart) {
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }

    let indexProduct = cart.products.findIndex((p) => p.productId.toString() === pid);
    if (indexProduct === -1) {
      return res.status(400).json({ error: `Producto con id ${pid} no encontrado en el carrito` });
    }

    cart.products.splice(indexProduct, 1);

    let updatedCart = await CartMongoManager.updateCart(cid, cart);
    return res.status(200).json({ updatedCart });
  } catch (error) {
    return res.status(400).json({ error: `${error.message}` });
  }
});


router.delete("/:cid", async (req, res) => {
  let { cid } = req.params;

  if (!isValidObjectId(cid)) {
    return res.status(400).json({ error: "ID de carrito inválido" });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid);
    if (!cart) {
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }

    cart.products = [];
    let updatedCart = await CartMongoManager.updateCart(cid, cart);
    return res.status(200).json({ updatedCart });
  } catch (error) {
    return res.status(400).json({ error: `${error.message}` });
  }
});

router.put("/:cid", async (req, res) => {
  let { cid } = req.params;
  let products = req.body.products;

  if (!isValidObjectId(cid)) {
    return res.status(400).json({ error: "ID de carrito inválido" });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid);
    if (!cart) {
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }

    for (let prod of products) {
      let product = await ProductMongoManager.getProductBy({
        _id: prod.productId,
      });
      if (!product) {
        return res
          .status(400)
          .json({ error: `Producto con id ${prod.productId} no existe` });
      }
    }

    cart.products = products;
    let updatedCart = await CartMongoManager.updateCart(cid, cart);
    return res.status(200).json({ updatedCart });
  } catch (error) {
    return res.status(400).json({ error: `${error.message}` });
  }
});

router.put("/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  let { quantity } = req.body;

  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    let cart = await CartMongoManager.getCartById(cid);
    if (!cart) {
      return res.status(400).json({ error: `No existe carrito con id ${cid}` });
    }

    let indexProduct = cart.products.findIndex(
      (p) => p.productId.toString() === pid
    );
    if (indexProduct === -1) {
      return res
        .status(400)
        .json({ error: `Producto con id ${pid} no encontrado en el carrito` });
    }

    cart.products[indexProduct].quantity = quantity;
    let updatedCart = await CartMongoManager.updateCart(cid, cart);
    return res.status(200).json({ updatedCart });
  } catch (error) {
    return res.status(400).json({ error: `${error.message}` });
  }
});

export { router as cartRouter };
