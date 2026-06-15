import { ProjectModule } from "../../types/project.js";
import { setupMonoWebDatabase } from "./database/index.js";
import MonoWebRouter from "./routes/index.js";

export const MonoWebProject: ProjectModule = {
  name: "mono-web",
  basePath: "/mono-web/techmillresource/mono-api/api",
  router: MonoWebRouter,
  setupDatabase: setupMonoWebDatabase,
};
