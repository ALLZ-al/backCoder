import productsModel from "./models/ProductModel.js";

export class ProductMongoManager {
  static async getProducts(page = 1, limit = 10, sort = "", query = {}) {
    let filter = {};

    if (query.title) {
      filter.title = { $regex: query.title, $options: "i" };
    }

    if (query.category) {
      filter.category = query.category;
    }

    let options = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true,
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
      return await productsModel.paginate(filter, options);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }

  static async createProduct(product = {}) {
    let newProduct = await productsModel.create(product);
    return newProduct.toJSON();
  }

  static async editProduct(id, product) {
    return await productsModel
      .findByIdAndUpdate(id, product, { new: true })
      .lean();
  }
}
