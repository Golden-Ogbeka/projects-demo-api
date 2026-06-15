import { ProjectModule } from "../../types/project.js";
import { setupLogisticsAdminDatabase } from "./database/index.js";
import LogisticsAdminRouter from "./routes/index.js";

export const LogisticsAdminProject: ProjectModule = {
  name: "logistics-admin",
  basePath: "/logistics-admin",
  router: LogisticsAdminRouter,
  setupDatabase: setupLogisticsAdminDatabase,
};
