import { ProjectModule } from "../../types/project.js";
import { setupEventMarketplaceDatabase } from "./database/index.js";
import EventMarketplaceRouter from "./routes/index.js";

export const EventMarketplaceWebProject: ProjectModule = {
  name: "event-marketplace-web",
  basePath: "/event-marketplace-web",
  router: EventMarketplaceRouter,
  setupDatabase: setupEventMarketplaceDatabase,
};
