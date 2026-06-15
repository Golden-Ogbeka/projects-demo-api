import { Router } from "express";
import { GraphqlController } from "../controllers/graphql.js";
import { RestApiController } from "../controllers/rest-api.js";

const LogisticsWebRouter = Router();
const Gql = GraphqlController();
const RestApi = RestApiController();

LogisticsWebRouter.post("/graphql", Gql.Handle);
LogisticsWebRouter.get("/graphql", (_req, res) => res.json({ message: "logistics-web GraphQL endpoint ready" }));
LogisticsWebRouter.post("/login", RestApi.Login);
LogisticsWebRouter.post("/forgot-password", RestApi.ForgotPassword);
LogisticsWebRouter.get("/google-place-details", RestApi.GooglePlaceDetails);
LogisticsWebRouter.post("/api/contact-us", RestApi.ContactUs);

export default LogisticsWebRouter;
