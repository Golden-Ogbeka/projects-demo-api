import { sqlite } from "../../../config/db.js";

export const setupExampleStoreDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS example_store_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      otp TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS example_store_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL,
      in_stock INTEGER NOT NULL DEFAULT 1
    );
  `);

  const userCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM example_store_users")
    .get() as { count: number };

  if (userCount.count === 0) {
    sqlite
      .prepare(
        `
          INSERT INTO example_store_users (name, email, password)
          VALUES (@name, @email, @password)
        `,
      )
      .run({
        name: "Demo Customer",
        email: "demo@example.com",
        password: "password",
      });
  }

  const productCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM example_store_products")
    .get() as { count: number };

  if (productCount.count === 0) {
    const insertProduct = sqlite.prepare(`
      INSERT INTO example_store_products
        (name, description, price, image_url, category, in_stock)
      VALUES
        (@name, @description, @price, @imageUrl, @category, @inStock)
    `);

    [
      {
        name: "Portfolio Hoodie",
        description: "Soft cotton hoodie used as a dummy ecommerce product.",
        price: 45,
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
        category: "Fashion",
        inStock: 1,
      },
      {
        name: "Workspace Lamp",
        description: "Minimal desk lamp for product listing screens.",
        price: 32.5,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
        category: "Home",
        inStock: 1,
      },
      {
        name: "Demo Backpack",
        description: "Travel backpack placeholder for cart and checkout flows.",
        price: 70,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        category: "Accessories",
        inStock: 1,
      },
    ].forEach((product) => insertProduct.run(product));
  }
};
