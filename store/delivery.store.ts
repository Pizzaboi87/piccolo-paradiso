import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const PREPARING_DURATION_MS = 1 * 60 * 1000;
export const TRANSIT_DURATION_MS = 1 * 60 * 1000;
export const ARRIVING_SOON_THRESHOLD_MS = 0.5 * 60 * 1000;

const TOTAL_DELIVERY_MS = PREPARING_DURATION_MS + TRANSIT_DURATION_MS;

type DeliveryState = {
  startedAt: number | null;
  destinationAddress: string | null;
  startDelivery: (destinationAddress: string) => void;
  clearDelivery: () => void;
  isDeliveryInProgress: () => boolean;
  getTotalRemainingMs: () => number;
};

const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      startedAt: null,
      destinationAddress: null,

      startDelivery: (destinationAddress) =>
        set({
          startedAt: Date.now(),
          destinationAddress,
        }),

      clearDelivery: () =>
        set({
          startedAt: null,
          destinationAddress: null,
        }),

      isDeliveryInProgress: () => {
        const startedAt = get().startedAt;
        if (!startedAt) return false;
        return Date.now() - startedAt < TOTAL_DELIVERY_MS;
      },

      getTotalRemainingMs: () => {
        const startedAt = get().startedAt;
        if (!startedAt) return 0;
        return Math.max(TOTAL_DELIVERY_MS - (Date.now() - startedAt), 0);
      },
    }),
    {
      name: "delivery-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useDeliveryStore;

