import { ProjectModule } from "../../types/project.js";
import { setupRealEstateAdminDatabase } from "./database/index.js";
import RealEstateAdminRouter from "./routes/index.js";

export const RealEstateAdminProject: ProjectModule = {
  name: "real-estate-admin",
  basePath: "/real-estate-admin",
  router: RealEstateAdminRouter,
  setupDatabase: setupRealEstateAdminDatabase,
};
