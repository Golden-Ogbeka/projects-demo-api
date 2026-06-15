import { Router } from "express";
import { body } from "express-validator";
import { LogisticsClientController } from "../controllers/index.js";

const LogisticsClientRouter = Router();
const Ctrl = LogisticsClientController();

/* ---------- Auth ---------- */
LogisticsClientRouter.post(
  "/v1/auth/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  Ctrl.Login,
);
LogisticsClientRouter.post(
  "/v1/auth/register",
  body("email").isEmail(),
  body("password").notEmpty(),
  Ctrl.Register,
);

/* ---------- Shipment ---------- */
LogisticsClientRouter.get("/v1/shipment", Ctrl.GetShipments);
LogisticsClientRouter.get("/v1/shipment/purpose-options", Ctrl.GetShipmentPurposeOptions);
LogisticsClientRouter.post("/v1/shipment", Ctrl.CreateShipment);
LogisticsClientRouter.post("/v1/shipment/arrange-pickup", Ctrl.ArrangePickup);

/* ---------- Rates ---------- */
LogisticsClientRouter.get("/v1/rates", Ctrl.GetRates);

/* ---------- Packaging ---------- */
LogisticsClientRouter.get("/v1/packaging", Ctrl.GetPackaging);
LogisticsClientRouter.post("/v1/packaging", Ctrl.CreatePackaging);
LogisticsClientRouter.get("/v1/packaging/types", Ctrl.GetPackagingTypes);
LogisticsClientRouter.patch("/v1/packaging/:id", Ctrl.UpdatePackaging);

/* ---------- Parcel ---------- */
LogisticsClientRouter.get("/v1/parcel", Ctrl.GetParcels);
LogisticsClientRouter.post("/v1/parcel", Ctrl.CreateParcel);
LogisticsClientRouter.patch("/v1/parcel/:id", Ctrl.UpdateParcel);

/* ---------- Address ---------- */
LogisticsClientRouter.get("/v1/address", Ctrl.GetAddress);
LogisticsClientRouter.post("/v1/address", Ctrl.CreateAddress);
LogisticsClientRouter.patch("/v1/address/:id", Ctrl.UpdateAddress);
LogisticsClientRouter.get("/v1/address/countries", Ctrl.GetCountries);
LogisticsClientRouter.get("/v1/address/countries/:countryCode/states", Ctrl.GetStates);
LogisticsClientRouter.get("/v1/address/countries/:countryCode/states/:stateCode/cities", Ctrl.GetCities);

export default LogisticsClientRouter;
