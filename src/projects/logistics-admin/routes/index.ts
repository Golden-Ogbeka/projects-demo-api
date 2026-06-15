import { Router } from "express";
import { GraphqlController } from "../controllers/graphql.js";
import { RestApiController } from "../controllers/rest-api.js";

const LogisticsAdminRouter = Router();
const Gql = GraphqlController();
const RestApi = RestApiController();

LogisticsAdminRouter.post("/graphql", Gql.Handle);
LogisticsAdminRouter.get("/graphql", (_req, res) => res.json({ message: "logistics-admin GraphQL endpoint ready" }));

LogisticsAdminRouter.post("/login", RestApi.Login);
LogisticsAdminRouter.post("/forgot-password", RestApi.ForgotPassword);
LogisticsAdminRouter.get("/dashboard-summary", RestApi.DashboardSummary);
LogisticsAdminRouter.post("/file-upload-signed-url", RestApi.FileUploadSignedUrl);

export default LogisticsAdminRouter;
