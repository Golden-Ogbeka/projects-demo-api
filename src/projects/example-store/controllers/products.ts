import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback, sendSuccessFeedback } from "../../../functions/feedback.js";
import { Product } from "../types/index.js";

export const ExampleStoreProductController = () => {
  const GetProducts = async (req: Request, res: Response) => {
    try {
      const category = req.query.category?.toString();
      const products = sqlite
        .prepare(
          `
            SELECT
              id,
              name,
              description,
              price,
              image_url as imageUrl,
              category,
              in_stock as inStock
            FROM example_store_products
            WHERE @category IS NULL OR category = @category
            ORDER BY id ASC
          `,
        )
        .all({ category: category || null }) as Product[];

      return sendSuccessFeedback(res, "Products retrieved", {
        products: products.map((product) => ({
          ...product,
          inStock: Boolean(product.inStock),
        })),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetProduct = async (req: Request<{ productId: string }>, res: Response) => {
    try {
      const product = sqlite
        .prepare(
          `
            SELECT
              id,
              name,
              description,
              price,
              image_url as imageUrl,
              category,
              in_stock as inStock
            FROM example_store_products
            WHERE id = ?
          `,
        )
        .get(req.params.productId) as Product | undefined;

      return sendSuccessFeedback(res, "Product retrieved", {
        product: product
          ? {
              ...product,
              inStock: Boolean(product.inStock),
            }
          : null,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    GetProducts,
    GetProduct,
  };
};
