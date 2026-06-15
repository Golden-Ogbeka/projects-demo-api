import { Router } from "express";
import { GraphqlController } from "../controllers/graphql.js";
import { UploadController } from "../controllers/upload.js";

const InventoryAdminWebRouter = Router();
const Gql = GraphqlController();
const Upload = UploadController();

InventoryAdminWebRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "inventory-admin-web dummy backend" });
});

InventoryAdminWebRouter.post("/graphql", Gql.Handle);
InventoryAdminWebRouter.get("/graphql", (_req, res) => {
  res.json({ message: "inventory-admin-web GraphQL endpoint ready." });
});

InventoryAdminWebRouter.post("/upload/media", Upload.HandleMultiple);

export default InventoryAdminWebRouter;
