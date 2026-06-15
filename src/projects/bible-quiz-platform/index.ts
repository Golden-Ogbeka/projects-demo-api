import { ProjectModule } from "../../types/project.js";
import { setupBibleQuizDatabase } from "./database/index.js";
import BibleQuizRouter from "./routes/index.js";

export const BibleQuizProject: ProjectModule = {
  name: "bible-quiz-platform",
  basePath: "/bible-quiz-platform/api/v1",
  router: BibleQuizRouter,
  setupDatabase: setupBibleQuizDatabase,
};
