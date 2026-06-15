import { ProjectModule } from "../../types/project.js";
import { setupVendorManagementAdminDatabase } from "./database/index.js";
import VendorManagementAdminWebRouter from "./routes/index.js";

export const VendorManagementAdminWebProject: ProjectModule = {
  name: "vendor-management-admin-web",
  basePath: "/vendor-management-web",
  router: VendorManagementAdminWebRouter,
  setupDatabase: setupVendorManagementAdminDatabase,
};
