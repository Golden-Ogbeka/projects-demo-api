import { ProjectModule } from "../../types/project.js";
import { setupFoodDeliveryAdminDatabase } from "./database/index.js";
import FoodDeliveryAdminRouter from "./routes/index.js";

export const FoodDeliveryAdminProject: ProjectModule = {
  name: "food-delivery-admin",
  basePath: "/food-delivery-admin",
  router: FoodDeliveryAdminRouter,
  setupDatabase: setupFoodDeliveryAdminDatabase,
};
