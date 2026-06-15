import { ExampleStoreProject } from "./example-store/index.js";
import { MonoWebProject } from "./mono-web/index.js";
import { GoogleMapsProject } from "./external-apis/google-maps/index.js";
import { InventoryAdminWebProject } from "./inventory-admin-web/index.js";
import { RetailPosWebProject } from "./retail-pos-web/index.js";
import { SaasPlatformAdminWebProject } from "./saas-platform-admin-web/index.js";
import { VendorManagementAdminWebProject } from "./vendor-management-admin-web/index.js";
import { CapAdminWebProject } from "./cap-admin-web/index.js";
import { BibleQuizProject } from "./bible-quiz-platform/index.js";
import { FoodDeliveryAdminProject } from "./food-delivery-admin/index.js";
import { FoodDeliveryWebProject } from "./food-delivery-web/index.js";
import { ArtisanServicesAdminProject } from "./artisan-services-admin/index.js";
import { ArtisanServicesWebProject } from "./artisan-services-web/index.js";
import { RealEstateAdminProject } from "./real-estate-admin/index.js";
import { LogisticsAdminProject } from "./logistics-admin/index.js";
import { LogisticsWebProject } from "./logistics-web/index.js";
import { LogisticsClientProject } from "./logistics-client/index.js";
import { EventMarketplaceWebProject } from "./event-marketplace-web/index.js";
import { FreelancerMarketplaceWebProject } from "./freelancer-marketplace-web/index.js";

export const projectModules = [
  SaasPlatformAdminWebProject,
  ExampleStoreProject,
  MonoWebProject,
  GoogleMapsProject,
  RetailPosWebProject,
  InventoryAdminWebProject,
  VendorManagementAdminWebProject,
  CapAdminWebProject,
  BibleQuizProject,
  FoodDeliveryAdminProject,
  FoodDeliveryWebProject,
  ArtisanServicesAdminProject,
  ArtisanServicesWebProject,
  RealEstateAdminProject,
  LogisticsAdminProject,
  LogisticsWebProject,
  LogisticsClientProject,
  EventMarketplaceWebProject,
  FreelancerMarketplaceWebProject,
];

export const setupProjectDatabases = () => {
  projectModules.forEach((projectModule) => projectModule.setupDatabase());
};
