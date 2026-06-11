import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import cn from "clsx";
import { router } from "expo-router";
import { Alert, Image, Linking, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RESTAURANT_PHONE = "+3645500150";

export default function OrderDeliveredScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleCallRestaurant = async () => {
    try {
      await Linking.openURL(`tel:${RESTAURANT_PHONE}`);
    } catch {
      Alert.alert("Hiba", "Nem sikerült elindítani a hívást.");
    }
  };

  return (
    <SafeAreaView className="screen">
      <View className="px-5 pt-5">
        <CustomHeader title="Rendelés megérkezett" />
      </View>

      <View className="flex-1 items-center justify-center px-6 pb-8">
        <Image source={images.pizzaReady} className="h-96 w-96" resizeMode="contain" />

        <Text className="mt-6 text-center text-3xl font-quicksand-bold text-text-primary">
          Rendelésed megérkezett!
        </Text>
        <Text className="body-large mt-3 text-center text-text-secondary">
          Reméljük, minden rendben volt a rendeléseddel. Várunk legközelebb is.
        </Text>

        <TouchableOpacity
          className="mt-8 w-full rounded-2xl border border-border-subtle bg-surface-muted px-4 py-4"
          onPress={handleCallRestaurant}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="paragraph-bold text-center mx-auto" style={isTablet ? { maxWidth: 560 } : undefined}>
            Ha rendeléseddel kapcsolatban bármilyen problémát tapasztaltál, vagy észrevételedet szeretnéd megosztani velünk, kérünk hívj minket az alábbi telefonszámon:
          </Text>
          <Text className="base-medium mt-1 text-center text-text-secondary">
            {RESTAURANT_PHONE}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={cn(isTablet ? "w-1/2 min-w-64 max-w-100" : "w-full", "mt-4 h-14 items-center justify-center rounded-2xl bg-brand-primary px-4")}
          onPress={() => router.replace("/(tabs)")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="paragraph-bold text-text-inverse">Vissza a főoldalra</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
