import { Router } from "express";
import { TemplateController } from "../controllers/index.js";

const TemplateRouter = Router();
const Controller = TemplateController();

TemplateRouter.get("/status", Controller.GetStatus);

export default TemplateRouter;
