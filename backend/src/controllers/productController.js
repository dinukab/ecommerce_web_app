const products = require("../../data/products");

// GET /api/products
exports.getAllProducts = (req, res) => {
  res.json(products);
};

// GET /api/products/:id
exports.getProductById = (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// GET /api/products/search
exports.searchProducts = (req, res) => {
  const { name, category, min, max } = req.query;

  let filtered = products;

  if (name) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (min) {
    filtered = filtered.filter(p => p.price >= Number(min));
  }

  if (max) {
    filtered = filtered.filter(p => p.price <= Number(max));
  }

  res.json(filtered);
};

// GET /api/products/category/:category
exports.getByCategory = (req, res) => {
  const filtered = products.filter(
    p => p.category === req.params.category
  );
  res.json(filtered);
};

// GET /api/products/featured
exports.getFeaturedProducts = (req, res) => {
  const featured = products.filter(p => p.featured);
  res.json(featured);
};
