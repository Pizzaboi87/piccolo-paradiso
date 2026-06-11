import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import {
  geocodeAddress,
  getRestaurantCoordinate,
  getRouteCoordinates
} from "@/lib/ors";
import useAuthStore from "@/store/auth.store";
import useDeliveryStore, {
  ARRIVING_SOON_THRESHOLD_MS,
  PREPARING_DURATION_MS,
  TRANSIT_DURATION_MS,
} from "@/store/delivery.store";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const COURIER_PHONE = "+36-70-206-6450";
const RESTAURANT_PHONE = "+36-45-500-150";

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const distanceMeters = (a: LatLng, b: LatLng) => {
  const R = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

const interpolatePoint = (a: LatLng, b: LatLng, ratio: number): LatLng => ({
  latitude: a.latitude + (b.latitude - a.latitude) * ratio,
  longitude: a.longitude + (b.longitude - a.longitude) * ratio,
});

const getPointOnRoute = (route: LatLng[], progress: number): LatLng => {
  if (route.length === 0) return { latitude: 0, longitude: 0 };
  if (route.length === 1) return route[0];
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  let totalDistance = 0;
  const segmentDistances: number[] = [];

  for (let i = 0; i < route.length - 1; i++) {
    const d = distanceMeters(route[i], route[i + 1]);
    segmentDistances.push(d);
    totalDistance += d;
  }

  if (totalDistance <= 0) return route[0];

  const targetDistance = totalDistance * progress;
  let covered = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    const segment = segmentDistances[i];
    if (covered + segment >= targetDistance) {
      const insideSegment = (targetDistance - covered) / segment;
      return interpolatePoint(route[i], route[i + 1], insideSegment);
    }
    covered += segment;
  }

  return route[route.length - 1];
};

const formatHuTime = (value: Date) =>
  value.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Budapest",
  });

const getDeliveryStatus = (
  totalElapsedMs: number,
  transitElapsedMs: number,
  transitRemainingMs: number
) => {
  if (totalElapsedMs < PREPARING_DURATION_MS) {
    return "Rendelésedet megkaptuk, éppen készítjük.";
  }

  if (transitElapsedMs >= TRANSIT_DURATION_MS) {
    return "Rendelésed megérkezett.";
  }

  if (transitRemainingMs <= ARRIVING_SOON_THRESHOLD_MS) {
    return "Rendelésed hamarosan megérkezik.";
  }

  return "A futár elindult a rendeléseddel.";
};

type StableMarkerProps = {
  coordinate: LatLng;
  source: ImageSourcePropType;
};

const StableMapMarker = ({ coordinate, source }: StableMarkerProps) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
      <View style={styles.markerContainer} collapsable={false} renderToHardwareTextureAndroid>
        <Image
          source={source}
          style={styles.markerIcon}
          resizeMode="contain"
          onLoadEnd={() => setTracksViewChanges(false)}
          fadeDuration={0}
        />
      </View>
    </Marker>
  );
};

export default function OrderTrackingScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { user } = useAuthStore();
  const startedAt = useDeliveryStore((state) => state.startedAt);
  const destinationAddress = useDeliveryStore((state) => state.destinationAddress);
  const isDeliveryInProgress = useDeliveryStore((state) => state.isDeliveryInProgress);
  const clearDelivery = useDeliveryStore((state) => state.clearDelivery);

  const [isLoading, setIsLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [restaurantCoord, setRestaurantCoord] = useState<LatLng | null>(null);
  const [customerCoord, setCustomerCoord] = useState<LatLng | null>(null);
  const [courierCoord, setCourierCoord] = useState<LatLng | null>(null);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 48.2161,
    longitude: 22.0828,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [isCourierStarted, setIsCourierStarted] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("Rendelés állapotának betöltése...");

  const fallbackAddress = useMemo(() => {
    const city = user?.city?.trim() || "Kisvárda";
    const street = user?.street?.trim() || "";
    const houseNumber = user?.houseNumber?.trim() || "";
    const floorDoor = user?.floorDoor?.trim() || "";
    return [city, street, houseNumber, floorDoor, "Hungary"].filter(Boolean).join(", ");
  }, [user?.city, user?.street, user?.houseNumber, user?.floorDoor]);
  const customerAddress = destinationAddress || fallbackAddress;

  useEffect(() => {
    if (!startedAt || !customerAddress) {
      setIsLoading(false);
      setDeliveryStatus("Nincs aktív rendelés.");
      setRouteCoords([]);
      setCourierCoord(null);
      return;
    }

    const loadMapData = async () => {
      try {
        setIsLoading(true);
        setDeliveryStatus("Rendelés állapotának betöltése...");
        const restaurant = getRestaurantCoordinate();
        const geocodeCandidates = Array.from(
          new Set([customerAddress, fallbackAddress, "Kisvárda, Hungary"])
        ).filter(Boolean);

        let customer: LatLng | null = null;
        let geocodeError: unknown = null;
        const failedCandidates: string[] = [];
        let resolvedCandidate = "";

        for (const candidate of geocodeCandidates) {
          try {
            customer = await geocodeAddress(candidate);
            resolvedCandidate = candidate;
            break;
          } catch (error) {
            geocodeError = error;
            failedCandidates.push(candidate);
          }
        }

        if (!customer) {
          const reason =
            geocodeError instanceof Error
              ? geocodeError.message
              : "Ismeretlen hiba";
          throw new Error(
            `Egyik cím sem geokódolható. Próbált címek: ${failedCandidates.join(
              " | "
            )}. ORS hiba: ${reason}`
          );
        }

        const route = await getRouteCoordinates(restaurant, customer);

        setRestaurantCoord(restaurant);
        setCustomerCoord(customer);
        setRouteCoords(route);
        setCourierCoord(route[0]);
        setInitialRegion({
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });
        console.log("[order-tracking] Geokódolás sikeres cím:", resolvedCandidate);
      } catch (e: any) {
        console.warn(
          "[order-tracking] Route load error:",
          e?.message ?? "Ismeretlen hiba"
        );
        Alert.alert("Hiba", "Nem sikerült betölteni a térképet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [customerAddress, fallbackAddress, startedAt]);

  useEffect(() => {
    if (routeCoords.length < 2 || !startedAt) return;

    const timer = setInterval(() => {
      const totalElapsed = Date.now() - startedAt;
      const totalDuration = PREPARING_DURATION_MS + TRANSIT_DURATION_MS;

      const transitElapsed = Math.min(
        Math.max(totalElapsed - PREPARING_DURATION_MS, 0),
        TRANSIT_DURATION_MS
      );
      const transitRemaining = Math.max(TRANSIT_DURATION_MS - transitElapsed, 0);

      setDeliveryStatus(
        getDeliveryStatus(totalElapsed, transitElapsed, transitRemaining)
      );
      setIsCourierStarted(totalElapsed >= PREPARING_DURATION_MS);

      if (totalElapsed < PREPARING_DURATION_MS) {
        setCourierCoord(routeCoords[0]);
        return;
      }

      const progress = Math.min(transitElapsed / TRANSIT_DURATION_MS, 1);
      setCourierCoord(getPointOnRoute(routeCoords, progress));

      if (totalElapsed >= totalDuration) {
        clearDelivery();
        router.replace("/order-delivered");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [routeCoords, startedAt, clearDelivery]);

  useEffect(() => {
    if (!mapRef.current || routeCoords.length === 0) return;

    const fitTimer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(routeCoords, {
        edgePadding: { top: 80, right: 50, bottom: 180, left: 50 },
        animated: true,
      });
    }, 250);

    const zoomToStartTimer = setTimeout(() => {
      if (!restaurantCoord) return;
      mapRef.current?.animateToRegion(
        {
          latitude: restaurantCoord.latitude,
          longitude: restaurantCoord.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        },
        700
      );
    }, 1300);

    return () => {
      clearTimeout(fitTimer);
      clearTimeout(zoomToStartTimer);
    };
  }, [routeCoords, restaurantCoord]);

  const etaRangeText = useMemo(() => {
    if (!startedAt) return "--:-- - --:--";
    const totalDuration = PREPARING_DURATION_MS + TRANSIT_DURATION_MS;
    const etaStart = new Date(startedAt + totalDuration);
    const etaEnd = new Date(etaStart.getTime() + 10 * 60 * 1000);
    return `${formatHuTime(etaStart)} - ${formatHuTime(etaEnd)}`;
  }, [startedAt]);

  const contact = isCourierStarted && isDeliveryInProgress()
    ? {
      title: `Futár hívása (${COURIER_PHONE})`,
      phone: COURIER_PHONE,
      image: images.courier,
    }
    : {
      title: `Étterem hívása (${RESTAURANT_PHONE})`,
      phone: RESTAURANT_PHONE,
      image: images.logo,
    };

  const handleCall = async () => {
    try {
      await Linking.openURL(`tel:${contact.phone}`);
    } catch {
      Alert.alert("Hiba", "Nem sikerült elindítani a hívást.");
    }
  };

  const handleBackPress = () => {
    const canGoBack =
      typeof (router as any).canGoBack === "function" ? (router as any).canGoBack() : false;

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="screen">
      <View className="px-5 pt-5">
        <CustomHeader title="Rendelés állapota" onBackPress={handleBackPress} />
      </View>

      <View className="mt-2 flex-1 px-5 pb-4">
        <View className="surface-card flex-1 overflow-hidden p-0">
          {isLoading ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#009F5A" />
              <Text className="body-large mt-3">Térkép betöltése...</Text>
            </View>
          ) : (
            <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
              {routeCoords.length > 1 ? (
                <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#009F5A" />
              ) : null}

              {customerCoord ? (
                <StableMapMarker coordinate={customerCoord} source={images.house} />
              ) : null}

              {courierCoord ? (
                <StableMapMarker coordinate={courierCoord} source={images.car} />
              ) : null}
            </MapView>
          )}

          {!isLoading && routeCoords.length < 2 ? (
            <View className="px-4 pb-2">
              <Text className="body-medium text-status-error">
                Az útvonal nem tölthető be.
              </Text>
            </View>
          ) : null}

          <View className="px-4 pb-4 pt-3">
            <Text className="base-bold">Várható érkezés ekkor: {etaRangeText}</Text>
            <Text className="base-semibold mt-2">
              {deliveryStatus}
            </Text>
          </View>

          <TouchableOpacity
            className="mx-4 mb-4 flex-row items-center rounded-2xl border border-border-subtle bg-surface-muted p-3"
            onPress={handleCall}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View className="size-16 items-center justify-center rounded-full border border-border-strong bg-surface-card">
              <Image source={contact.image} className="size-14 rounded-full" resizeMode="cover" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="paragraph-bold">{contact.title}</Text>
              <Text className="body-medium mt-1">Érintsd meg a híváshoz</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    flex: 1,
    minHeight: 360,
  },
  mapLoading: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#009F5A",
    alignItems: "center",
    justifyContent: "center",
  },
  markerIcon: {
    width: 24,
    height: 24,
  },
});
