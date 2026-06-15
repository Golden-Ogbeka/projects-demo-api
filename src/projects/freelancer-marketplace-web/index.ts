import { ProjectModule } from "../../types/project.js";
import { setupFreelancerMarketplaceDatabase } from "./database/index.js";
import FreelancerMarketplaceRouter from "./routes/index.js";

export const FreelancerMarketplaceWebProject: ProjectModule = {
  name: "freelancer-marketplace-web",
  basePath: "/freelancer-marketplace-web",
  router: FreelancerMarketplaceRouter,
  setupDatabase: setupFreelancerMarketplaceDatabase,
};
