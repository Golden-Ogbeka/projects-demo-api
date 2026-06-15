import { ProjectModule } from "../../types/project.js";
import { setupFoodDeliveryWebDatabase } from "./database/index.js";
import FoodDeliveryWebRouter from "./routes/index.js";

export const FoodDeliveryWebProject: ProjectModule = {
  name: "food-delivery-web",
  basePath: "/food-delivery-web",
  router: FoodDeliveryWebRouter,
  setupDatabase: setupFoodDeliveryWebDatabase,
};
