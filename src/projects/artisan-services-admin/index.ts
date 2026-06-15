import { ProjectModule } from "../../types/project.js";
import { setupArtisanServicesAdminDatabase } from "./database/index.js";
import ArtisanServicesAdminRouter from "./routes/index.js";

export const ArtisanServicesAdminProject: ProjectModule = {
  name: "artisan-services-admin",
  basePath: "/artisan-services-admin/admin/v1",
  router: ArtisanServicesAdminRouter,
  setupDatabase: setupArtisanServicesAdminDatabase,
};
