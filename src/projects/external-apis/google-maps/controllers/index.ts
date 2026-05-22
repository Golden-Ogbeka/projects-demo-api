import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { sqlite } from "../../../../config/db.js";
import {
  sendCatchFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback.js";
import { GeocodeBody, GooglePlace } from "../types/index.js";

export const GoogleMapsController = () => {
  const SearchPlaces = async (req: Request, res: Response) => {
    try {
      const query = req.query.query?.toString().toLowerCase() || "";

      const places = sqlite
        .prepare(
          `
            SELECT
              id,
              place_id as placeId,
              name,
              address,
              latitude,
              longitude,
              rating
            FROM google_maps_places
            WHERE lower(name) LIKE @query OR lower(address) LIKE @query
            ORDER BY rating DESC
          `,
        )
        .all({ query: `%${query}%` }) as GooglePlace[];

      return sendSuccessFeedback(res, "Places retrieved", {
        results: places,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const Geocode = async (
    req: Request<never, never, GeocodeBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const address = req.body.address.toLowerCase();
      const place = sqlite
        .prepare(
          `
            SELECT
              id,
              place_id as placeId,
              name,
              address,
              latitude,
              longitude,
              rating
            FROM google_maps_places
            WHERE lower(address) LIKE @address OR lower(name) LIKE @address
            ORDER BY rating DESC
            LIMIT 1
          `,
        )
        .get({ address: `%${address}%` }) as GooglePlace | undefined;

      return sendSuccessFeedback(res, "Geocode generated", {
        result: place || {
          placeId: "demo-geocode-fallback",
          name: "Demo Location",
          address: req.body.address,
          latitude: 6.5244,
          longitude: 3.3792,
          rating: 4.0,
        },
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    SearchPlaces,
    Geocode,
  };
};
