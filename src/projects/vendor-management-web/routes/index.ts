import { Router } from "express";
import { GraphqlController } from "../controllers/graphql.js";
import { UploadController } from "../controllers/upload.js";

const VendorManagementWebRouter = Router();
const Gql = GraphqlController();
const Upload = UploadController();

VendorManagementWebRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "vendor-management-web dummy backend" });
});

VendorManagementWebRouter.post("/graphql", Gql.Handle);
VendorManagementWebRouter.get("/graphql", (_req, res) => {
  res.json({ message: "vendor-management-web GraphQL endpoint ready." });
});

VendorManagementWebRouter.post("/upload/media", Upload.HandleMultiple);

export default VendorManagementWebRouter;
