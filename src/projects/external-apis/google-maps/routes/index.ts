import { Router } from "express";
import { body } from "express-validator";
import { GoogleMapsController } from "../controllers/index.js";

const GoogleMapsRouter = Router();
const Controller = GoogleMapsController();

GoogleMapsRouter.get("/places/search", Controller.SearchPlaces);

GoogleMapsRouter.post(
  "/geocode",
  [body("address", "Address is required").exists({ checkFalsy: true }).trim()],
  Controller.Geocode,
);

export default GoogleMapsRouter;
