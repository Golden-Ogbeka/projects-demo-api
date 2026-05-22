import { ProjectModule } from "../../types/project.js";
import { setupSaasPlatformAdminDatabase } from "./database/index.js";
import SaasPlatformAdminRouter from "./routes/index.js";

export const SaasPlatformAdminWebProject: ProjectModule = {
  name: "saas-platform-admin-web",
  basePath: "/saas-platform-admin-web",
  router: SaasPlatformAdminRouter,
  setupDatabase: setupSaasPlatformAdminDatabase,
};
