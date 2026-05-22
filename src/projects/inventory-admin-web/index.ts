import { ProjectModule } from "../../types/project.js";
import { setupInventoryAdminWebDatabase } from "./database/index.js";
import InventoryAdminWebRouter from "./routes/index.js";

export const InventoryAdminWebProject: ProjectModule = {
  name: "inventory-admin-web",
  basePath: "/inventory-admin-web",
  router: InventoryAdminWebRouter,
  setupDatabase: setupInventoryAdminWebDatabase,
};
