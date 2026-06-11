type LatLng = {
  latitude: number;
  longitude: number;
};

const ORS_BASE_URL = "https://api.openrouteservice.org";
const RESTAURANT_ADDRESS = "4600 Kisvárda, Kölcsey utca 26, Hungary";
const RESTAURANT_COORDINATE: LatLng = {
  latitude: 48.218448,
  longitude: 22.075202,
};

const getOrsApiKey = () => {
  const key = process.env.EXPO_PUBLIC_ORS_API_KEY;
  if (!key) {
    throw new Error("Hiányzik az EXPO_PUBLIC_ORS_API_KEY beállítás.");
  }
  return key;
};

export const getRestaurantAddress = () => RESTAURANT_ADDRESS;
export const getRestaurantCoordinate = () => RESTAURANT_COORDINATE;

export const geocodeAddress = async (address: string): Promise<LatLng> => {
  const key = getOrsApiKey();
  const params = new URLSearchParams({
    api_key: key,
    text: address,
    size: "1",
    "boundary.country": "HU",
  });

  const response = await fetch(`${ORS_BASE_URL}/geocode/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Nem sikerült geokódolni a címet.");
  }

  const data = await response.json();
  const coordinates = data?.features?.[0]?.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    throw new Error("A cím koordinátái nem találhatók.");
  }

  return { latitude: coordinates[1], longitude: coordinates[0] };
};

export const getRouteCoordinates = async (
  start: LatLng,
  end: LatLng
): Promise<LatLng[]> => {
  const key = getOrsApiKey();
  const response = await fetch(
    `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [start.longitude, start.latitude],
          [end.longitude, end.latitude],
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni az útvonalat.");
  }

  const data = await response.json();
  const coords = data?.features?.[0]?.geometry?.coordinates ?? [];

  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error("Az útvonal nem elérhető.");
  }

  return coords.map((point: [number, number]) => ({
    latitude: point[1],
    longitude: point[0],
  }));
};
