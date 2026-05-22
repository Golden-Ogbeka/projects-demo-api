import { ProjectModule } from "../../types/project.js";
import { setupVendorManagementWebDatabase } from "./database/index.js";
import VendorManagementWebRouter from "./routes/index.js";

export const VendorManagementWebProject: ProjectModule = {
  name: "vendor-management-web",
  basePath: "/vendor-management-web",
  router: VendorManagementWebRouter,
  setupDatabase: setupVendorManagementWebDatabase,
};
