import { ProjectModule } from "../../types/project.js";
import { setupRetailPosWebDatabase } from "./database/index.js";
import RetailPosWebRouter from "./routes/index.js";

export const RetailPosWebProject: ProjectModule = {
  name: "retail-pos-web",
  basePath: "/retail-pos-web",
  router: RetailPosWebRouter,
  setupDatabase: setupRetailPosWebDatabase,
};
