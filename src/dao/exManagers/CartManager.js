import fs from "fs";
import ProductManager from "./ProductManager.js";

class CartManager {
  constructor(path) {
    this.path = path;
    this.carts = this.loadCarts();
    this.productManager = new ProductManager("./src/data/products.json");
  }

  createCart() {
    const newCart = {
      id: this.carts.length + 1,
      products: [],
    };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  loadCarts() {
    try {
      const data = fs.readFileSync(this.path, "utf-8");
      return JSON.parse(data) || [];
    } catch (error) {
      console.error("Error al leer los carritos", error);
      return [];
    }
  }

  saveCarts() {
    fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
  }

  getCartById(id) {
    const cart = this.carts.find((c) => c.id === id);
    return cart ? cart : "Carrito no encontrado";
  }

  addProductToCart(cartId, productId) {
    const cart = this.getCartById(cartId);
    if (cart === "Carrito no encontrado") {
      return "Carrito no encontrado";
    }

    const product = this.productManager.getProductById(productId);
    if (product === "Producto no encontrado") {
      return "Producto no encontrado";
    }

    const productInCart = cart.products.find((p) => p.product === productId);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    this.saveCarts();
    return cart;
  }
}

export default CartManager;
