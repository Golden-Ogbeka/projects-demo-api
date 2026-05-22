import { ExampleStoreProject } from "./example-store/index.js";
import { GoogleMapsProject } from "./external-apis/google-maps/index.js";
import { RetailPosWebProject } from "./retail-pos-web/index.js";
import { SaasPlatformAdminWebProject } from "./saas-platform-admin-web/index.js";
import { InventoryAdminWebProject } from "./inventory-admin-web/index.js";
import { VendorManagementAdminWebProject } from "./vendor-management-admin-web/index.js";
import { VendorManagementWebProject } from "./vendor-management-web/index.js";

export const projectModules = [
  SaasPlatformAdminWebProject,
  ExampleStoreProject,
  GoogleMapsProject,
  RetailPosWebProject,
  InventoryAdminWebProject,
  VendorManagementAdminWebProject,
  VendorManagementWebProject,
];

export const setupProjectDatabases = () => {
  projectModules.forEach((projectModule) => projectModule.setupDatabase());
};
