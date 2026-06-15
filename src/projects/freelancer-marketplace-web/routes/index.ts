import { Router, Request, Response } from "express";
import { FreelancerMarketplaceGraphqlController } from "../controllers/graphql.js";

const FreelancerMarketplaceRouter = Router();
const GraphqlController = FreelancerMarketplaceGraphqlController();

FreelancerMarketplaceRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Freelancer Marketplace dummy backend",
    data: {
      graphql: "/freelancer-marketplace-web/graphql",
      demoLogin: { email: "demo@demo.com", password: "password" },
    },
  });
});

FreelancerMarketplaceRouter.post("/graphql", GraphqlController.HandleGraphql);
FreelancerMarketplaceRouter.get("/graphql", (_req: Request, res: Response) => {
  res.json({ success: true, message: "POST GraphQL operations to this endpoint." });
});

// Social auth redirect endpoints
FreelancerMarketplaceRouter.get("/google", (_req: Request, res: Response) => {
  res.redirect("/freelancer-marketplace-web/auth/callback?strategy=google&code=demo-google-code");
});

FreelancerMarketplaceRouter.get("/facebook", (_req: Request, res: Response) => {
  res.redirect("/freelancer-marketplace-web/auth/callback?strategy=facebook&code=demo-facebook-code");
});

FreelancerMarketplaceRouter.get("/linkedin", (_req: Request, res: Response) => {
  res.redirect("/freelancer-marketplace-web/auth/callback?strategy=linkedin&code=demo-linkedin-code");
});

FreelancerMarketplaceRouter.get("/auth/callback", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Social auth callback handled",
    data: {
      user: {
        _id: "user-1",
        name: "Demo Freelancer",
        email: "demo@demo.com",
      },
      token: "demo-social-token",
    },
  });
});

export default FreelancerMarketplaceRouter;
