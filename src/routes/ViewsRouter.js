import express from "express";
import { ProductMongoManager } from "../dao/ProductMongoManager.js";
import { CartMongoManager } from "../dao/CartMongoManager.js";
import productsModel from "../dao/models/ProductModel.js";
import cartModel from "../dao/models/CartModel.js";
import cookieParser from "cookie-parser";

const router = express.Router();

router.get("/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { title, category, sort } = req.query;

  let filter = {};

  if (title) {
    filter.title = { $regex: title, $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  let options = {
    page: page,
    limit: limit,
  };

  if (sort) {
    const sortOptions =
      sort === "asc"
        ? { price: 1 }
        : sort === "desc"
        ? { price: -1 }
        : { price: 1 };
    options.sort = sortOptions;
  }

  try {
    const result = await productsModel.paginate(filter, options);

    console.log({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/products?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `/products?page=${result.nextPage}&limit=${limit}`
        : null,
    });

    res.render("index", {
      products: result.docs,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      totalPages: result.totalPages,
      currentPage: result.page,
      title,
      category,
      sort,
      limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener productos");
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductMongoManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/carts", async (req, res) => {
  try {
    const carts = await cartModel.find().populate("products.productId");

    res.render("carts", { carts });
  } catch (error) {
    console.error("Error al obtener los carritos:", error);
    res.status(500).send("Error al obtener los carritos");
  }
});

router.get("/cart/:id", async (req, res) => {
  const cartId = req.params.id;

  try {
    const cart = await CartMongoManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.render("cartDetails", { cart });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).send("Error al obtener el carrito");
  }
});

router.get("/product/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    const product = await productsModel.findById(productId);

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", { product });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.use(
  cookieParser("$2a$12$qrJ.BrCVy6C0pL3FQsUfPOWgG5mIc9GXfeQ/gTXA60RRtNkRNvusK")
);

router.get("/", (req, res) => {
  res.render("index", {});
});

function auth(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  } else {
    return res
      .status(403)
      .send("Acceso denegado. Se requiere rol de administrador.");
  }
}

router.get("/private", auth, (req, res) => {
  res.send(
    "Si estas viendo esto es porque pasaste la autorización a este recurso"
  );
});

export { router };
