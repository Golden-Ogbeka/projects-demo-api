import { Router } from "express";
import { GraphqlController } from "../controllers/graphql.js";
import { RestApiController } from "../controllers/rest-api.js";
import { UploadController } from "../controllers/upload.js";

const CapAdminWebRouter = Router();
const Gql = GraphqlController();
const Upload = UploadController();
const RestApi = RestApiController();

CapAdminWebRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "cap-admin-web dummy backend" });
});

CapAdminWebRouter.post("/graphql", Gql.Handle);
CapAdminWebRouter.get("/graphql", (_req, res) => {
  res.json({ message: "cap-admin-web GraphQL endpoint ready." });
});

CapAdminWebRouter.post("/upload/media", Upload.HandleMultiple);

// REST API routes (mounted at /api via client's REACT_APP_REST_API)
CapAdminWebRouter.post("/api/upload/upload_products/:productId", RestApi.UploadProductImage);
CapAdminWebRouter.post("/api/upload/upload-rebate-discount", RestApi.UploadRebateDiscount);
CapAdminWebRouter.post("/api/upload/upload-target", RestApi.UploadTarget);
CapAdminWebRouter.post("/api/upload/upload_admin_image/:id", RestApi.UploadAdminImage);
CapAdminWebRouter.get("/api/upload/download_audit_trail", RestApi.DownloadAuditTrail);
CapAdminWebRouter.post("/api/auth/refresh-token", RestApi.RefreshToken);

export default CapAdminWebRouter;
