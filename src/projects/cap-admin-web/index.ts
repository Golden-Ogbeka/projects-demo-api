import { ProjectModule } from "../../types/project.js";
import { setupCapAdminWebDatabase } from "./database/index.js";
import CapAdminWebRouter from "./routes/index.js";

export const CapAdminWebProject: ProjectModule = {
  name: "cap-admin-web",
  basePath: "/cap-admin-web",
  router: CapAdminWebRouter,
  setupDatabase: setupCapAdminWebDatabase,
};
