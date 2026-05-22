import { Router } from "express";
import ExampleStoreAuthRouter from "./auth.js";
import ExampleStoreProductRouter from "./products.js";

const ExampleStoreRouter = Router();

ExampleStoreRouter.use("/auth", ExampleStoreAuthRouter);
ExampleStoreRouter.use("/products", ExampleStoreProductRouter);

export default ExampleStoreRouter;
