import { ProjectModule } from "../../types/project.js";
import { setupExampleStoreDatabase } from "./database/index.js";
import ExampleStoreRouter from "./routes/index.js";

export const ExampleStoreProject: ProjectModule = {
  name: "example-store",
  basePath: "/example-store",
  router: ExampleStoreRouter,
  setupDatabase: setupExampleStoreDatabase,
};
