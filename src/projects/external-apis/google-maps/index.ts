import { ProjectModule } from "../../../types/project.js";
import { setupGoogleMapsDatabase } from "./database/index.js";
import GoogleMapsRouter from "./routes/index.js";

export const GoogleMapsProject: ProjectModule = {
  name: "external-api-google-maps",
  basePath: "/external/google-maps",
  router: GoogleMapsRouter,
  setupDatabase: setupGoogleMapsDatabase,
};
