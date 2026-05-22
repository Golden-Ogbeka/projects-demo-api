export type GooglePlace = {
  id: number;
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
};

export type GeocodeBody = {
  address: string;
};
