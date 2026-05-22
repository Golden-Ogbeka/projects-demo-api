import { Router } from "express";
import { param } from "express-validator";
import { ExampleStoreProductController } from "../controllers/products.js";

const ExampleStoreProductRouter = Router();
const Controller = ExampleStoreProductController();

ExampleStoreProductRouter.get("/", Controller.GetProducts);

ExampleStoreProductRouter.get(
  "/:productId",
  [param("productId", "Product ID must be numeric").isInt()],
  Controller.GetProduct,
);

export default ExampleStoreProductRouter;
