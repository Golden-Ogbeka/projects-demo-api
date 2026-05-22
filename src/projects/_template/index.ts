import { ProjectModule } from "../../types/project.js";
import { setupTemplateDatabase } from "./database/index.js";
import TemplateRouter from "./routes/index.js";

export const TemplateProject: ProjectModule = {
  name: "template",
  basePath: "/template",
  router: TemplateRouter,
  setupDatabase: setupTemplateDatabase,
};
