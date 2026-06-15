import { ProjectModule } from "../../types/project.js";
import { setupLogisticsClientDatabase } from "./database/index.js";
import LogisticsClientRouter from "./routes/index.js";

export const LogisticsClientProject: ProjectModule = {
  name: "logistics-client",
  basePath: "/logistics-client",
  router: LogisticsClientRouter,
  setupDatabase: setupLogisticsClientDatabase,
};
