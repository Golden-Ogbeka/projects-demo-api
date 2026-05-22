import { Router } from "express";
import { InventoryAdminWebGraphqlController } from "../controllers/graphql.js";
import { InventoryAdminWebUploadController } from "../controllers/upload.js";

const InventoryAdminWebRouter = Router();
const GraphqlController = InventoryAdminWebGraphqlController();
const UploadController = InventoryAdminWebUploadController();

InventoryAdminWebRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Inventory Admin Web dummy backend",
    data: {
      graphql: "/inventory-admin-web/graphql",
      upload: "/inventory-admin-web/upload/media",
      demoLogin: { userName: "demo", password: "password" },
    },
  });
});

InventoryAdminWebRouter.post("/graphql", GraphqlController.HandleGraphql);
InventoryAdminWebRouter.get("/graphql", (_req, res) => {
  res.json({ success: true, message: "POST GraphQL operations to this endpoint." });
});
InventoryAdminWebRouter.post("/upload/media", UploadController.UploadMedia);

export default InventoryAdminWebRouter;
