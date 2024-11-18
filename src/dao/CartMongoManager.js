import cartModel from "./models/CartModel.js";

export class CartMongoManager {
  static async getCartById(cartId) {
    try {
      const cart = await cartModel
        .findById(cartId)
        .populate("products.productId")
        .lean();

      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      return cart;
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      throw error;
    }
  }

  static async createCart(cart = { products: [] }) {
    const newCart = await cartModel.create(cart);
    return newCart.toJSON();
  }

  static async addProductToCart(cartId, productId, quantity) {
    const cart = await cartModel.findById(cartId);
    const product = await productsModel.findById(productId);

    if (!product) {
      console.log("Producto no encontrado");
      return;
    }

    cart.products.push({
      productId: product._id,
      quantity: quantity || 1,
    });

    await cart.save();
    console.log("Producto añadido al carrito");
  }

  static async getProductFromCart(cartId, productId) {
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return "Carrito no encontrado";
    }

    const product = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (!product) {
      return "Producto no encontrado";
    }

    return product;
  }

  static async removeProductFromCart(cartId, productId) {
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return "Carrito no encontrado";
    }

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );
    await cart.save();

    return cart;
  }

  static async updateCart(cartId, productsArray) {
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return "Carrito no encontrado";
    }

    cart.products = productsArray;
    await cart.save();

    return cart;
  }

  static async updateProductQuantity(cartId, productId, quantity) {
    const populatedCart = await cartModel
      .findById(cartId)
      .populate("products.productId");

    if (!populatedCart) {
      return "Carrito no encontrado";
    }

    const productIndex = populatedCart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) {
      return "Producto no encontrado en el carrito";
    }

    populatedCart.products[productIndex].quantity = quantity;
    await populatedCart.save();

    return populatedCart.products[productIndex];
  }
}
