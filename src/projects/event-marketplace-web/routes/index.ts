import { Router } from "express";
import { EventMarketplaceGraphqlController } from "../controllers/graphql.js";

const EventMarketplaceRouter = Router();
const GraphqlController = EventMarketplaceGraphqlController();

EventMarketplaceRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Event Marketplace dummy backend",
    data: {
      graphql: "/event-marketplace-web/graphql",
      demoLogin: { email: "demo@example.com", password: "password" },
    },
  });
});

EventMarketplaceRouter.post("/graphql", GraphqlController.HandleGraphql);
EventMarketplaceRouter.get("/graphql", (_req, res) => {
  res.json({ success: true, message: "POST GraphQL operations to this endpoint." });
});

export default EventMarketplaceRouter;
