import fs from "fs";

class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, "utf-8");
      return JSON.parse(data) || [];
    } catch (error) {
      console.error("Error al leer el archivo:", error);
      return [];
    }
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
  }

  getProducts() {
    return this.products;
  }

  addProduct(product) {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = product;

    if (
      !title ||
      !description ||
      !code ||
      !price ||
      status === undefined ||
      !stock ||
      !category
    ) {
      console.log("Todos los campos son requeridos");
      return "Error: Todos los campos son requeridos";
    }

    const existingProduct = this.products.find((p) => p.code === code);
    if (existingProduct) {
      return "Error: El código ya existe";
    }

    const newProduct = {
      id: this.products.length + 1,
      title,
      description,
      code,
      price,
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails: thumbnails || [],
    };

    this.products.push(newProduct);
    this.saveProducts();

    return newProduct;
  }

  getProductById(id) {
    const product = this.products.find((p) => p.id === Number(id));
    return product ? product : "Producto no encontrado";
  }

  updateProduct(id, updatedProduct) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return "Producto no encontrado";
    }

    this.products[index] = { ...this.products[index], ...updatedProduct };
    this.saveProducts();
    return this.products[index];
  }

  deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return "Producto no encontrado";
    }

    this.products.splice(index, 1);
    this.saveProducts();
    return "Producto eliminado";
  }
}

export default ProductManager;
