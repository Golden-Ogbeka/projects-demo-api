import { Router } from "express";
import { SaasPlatformAdminGraphqlController } from "../controllers/graphql.js";
import { SaasPlatformAdminUploadController } from "../controllers/upload.js";

const SaasPlatformAdminRouter = Router();
const GraphqlController = SaasPlatformAdminGraphqlController();
const UploadController = SaasPlatformAdminUploadController();

SaasPlatformAdminRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "SaaS Platform Admin Web dummy backend",
    data: {
      graphql: "/saas-platform-admin-web/graphql",
      upload: "/saas-platform-admin-web/upload/media",
      demoLogin: {
        userName: "demo",
        password: "password",
      },
    },
  });
});

SaasPlatformAdminRouter.post("/graphql", GraphqlController.HandleGraphql);
SaasPlatformAdminRouter.get("/graphql", (_req, res) => {
  res.json({
    success: true,
    message: "POST GraphQL operations to this endpoint.",
  });
});

SaasPlatformAdminRouter.post("/upload/media", UploadController.UploadMedia);

export default SaasPlatformAdminRouter;
