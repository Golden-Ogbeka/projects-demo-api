import { ProjectModule } from "../../types/project.js";
import { setupLogisticsWebDatabase } from "./database/index.js";
import LogisticsWebRouter from "./routes/index.js";

export const LogisticsWebProject: ProjectModule = {
  name: "logistics-web",
  basePath: "/logistics-web",
  router: LogisticsWebRouter,
  setupDatabase: setupLogisticsWebDatabase,
};
