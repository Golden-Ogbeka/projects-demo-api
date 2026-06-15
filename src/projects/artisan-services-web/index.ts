import { ProjectModule } from "../../types/project.js";
import { setupArtisanServicesWebDatabase } from "./database/index.js";
import ArtisanServicesWebRouter from "./routes/index.js";

export const ArtisanServicesWebProject: ProjectModule = {
  name: "artisan-services-web",
  basePath: "/artisan-services-web",
  router: ArtisanServicesWebRouter,
  setupDatabase: setupArtisanServicesWebDatabase,
};
