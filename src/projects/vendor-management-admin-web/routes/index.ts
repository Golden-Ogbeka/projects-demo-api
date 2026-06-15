import { Router } from "express";
import { VendorManagementGraphqlController } from "../controllers/graphql.js";
import { VendorManagementUploadController } from "../controllers/upload.js";

const VendorManagementAdminWebRouter = Router();
const GraphqlController = VendorManagementGraphqlController();
const UploadController = VendorManagementUploadController();

VendorManagementAdminWebRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Vendor Management Admin Web dummy backend",
    data: {
      graphql: "/vendor-management-web/graphql",
      upload: "/vendor-management-web/upload/media",
      demoLogin: { userName: "demo.admin", password: "password" },
    },
  });
});

VendorManagementAdminWebRouter.post("/graphql", GraphqlController.HandleGraphql);
VendorManagementAdminWebRouter.get("/graphql", (_req, res) => {
  res.json({ success: true, message: "POST GraphQL operations to this endpoint." });
});
VendorManagementAdminWebRouter.post("/upload/media", UploadController.UploadMedia);

export default VendorManagementAdminWebRouter;
