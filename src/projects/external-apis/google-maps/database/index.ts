import { sqlite } from "../../../../config/db.js";

export const setupGoogleMapsDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS google_maps_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      rating REAL NOT NULL
    );
  `);

  const placeCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM google_maps_places")
    .get() as { count: number };

  if (placeCount.count > 0) return;

  const insertPlace = sqlite.prepare(`
    INSERT INTO google_maps_places
      (place_id, name, address, latitude, longitude, rating)
    VALUES
      (@placeId, @name, @address, @latitude, @longitude, @rating)
  `);

  [
    {
      placeId: "demo-place-lagos-1",
      name: "Demo Cafe Victoria Island",
      address: "10 Portfolio Street, Victoria Island, Lagos",
      latitude: 6.4281,
      longitude: 3.4219,
      rating: 4.7,
    },
    {
      placeId: "demo-place-abuja-1",
      name: "Demo Workspace Abuja",
      address: "22 Showcase Avenue, Wuse 2, Abuja",
      latitude: 9.0765,
      longitude: 7.3986,
      rating: 4.5,
    },
  ].forEach((place) => insertPlace.run(place));
};
