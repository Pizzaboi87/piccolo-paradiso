import CartButton from "@/components/CartButton";
import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { isMidweekDealActive } from "@/lib/promotions";
import useAuthStore from "@/store/auth.store";
import useDeliveryStore, {
  ARRIVING_SOON_THRESHOLD_MS,
  PREPARING_DURATION_MS,
  TRANSIT_DURATION_MS,
} from "@/store/delivery.store";
import cn from "clsx";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user } = useAuthStore();
  const startedAt = useDeliveryStore((state) => state.startedAt);
  const isDeliveryInProgress = useDeliveryStore((state) => state.isDeliveryInProgress);

  const midweekDealActive = isMidweekDealActive();
  const deliveryActive = isDeliveryInProgress();
  const hasDeliveryAddress = Boolean(user?.street?.trim() && user?.houseNumber?.trim());
  const addressLine = hasDeliveryAddress
    ? `${user?.street?.trim()} ${user?.houseNumber?.trim()}${user?.floorDoor?.trim() ? `, ${user.floorDoor.trim()}` : ""}`
    : "Új címet adok meg";

  const activeDeliveryStatus = useMemo(() => {
    if (!deliveryActive || !startedAt) return "";

    const totalElapsedMs = Date.now() - startedAt;
    const transitElapsedMs = Math.min(
      Math.max(totalElapsedMs - PREPARING_DURATION_MS, 0),
      TRANSIT_DURATION_MS
    );
    const transitRemainingMs = Math.max(TRANSIT_DURATION_MS - transitElapsedMs, 0);

    if (totalElapsedMs < PREPARING_DURATION_MS) {
      return "Rendelésedet készítjük.";
    }

    if (transitElapsedMs >= TRANSIT_DURATION_MS) {
      return "Rendelésed megérkezett.";
    }

    if (transitRemainingMs <= ARRIVING_SOON_THRESHOLD_MS) {
      return "Rendelésed hamarosan megérkezik.";
    }

    return "A futár úton van a rendeléseddel.";
  }, [deliveryActive, startedAt]);
  const homeOffers = useMemo(
    () => [
      {
        id: "midweek",
        title: "MIDWEEK DEAL",
        subtitle: midweekDealActive
          ? "Hurrá, szerda! Ma minden megrendlésre 10% kedvezményt adunk."
          : "Szerdánként minden megrendelésre 10% kedvezményt adunk.",
        image: images.percent,
        gradient: [tokens.color.offer.pizza, "#c1fba4"] as const,
      },
      {
        id: "pair-deal",
        title: "PÁROS AKCIÓ",
        subtitle: "2 nagy pizza rendelésekor 2 Coca-Cola ajándék.",
        image: images.cola,
        gradient: [tokens.color.offer.summer, "#F25D2E"] as const,
      },
      {
        id: "free-delivery-kisvarda",
        title: "INGYENES KISZÁLLÍTÁS",
        subtitle: "Kisvárda területén a kiszállítás díjmentes.",
        image: images.delivery,
        gradient: [tokens.color.offer.burger, "#F08A2A"] as const,
      },
    ],
    [midweekDealActive]
  );

  return (
    <SafeAreaView className="screen">
      <FlatList
        ListHeaderComponent={() => (
          <View>
            <View className="flex-between my-4 w-full flex-row">
              <View className="flex-start">
                <Text className="small-bold md:text-lg text-brand-primary">KISZÁLLÍTÁS IDE</Text>
                <TouchableOpacity
                  className="mt-1 flex-center flex-row gap-x-1"
                  onPress={() => router.push("/profile")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="paragraph-bold">
                    {addressLine}
                  </Text>
                  <Image
                    source={images.arrowDown}
                    className="size-3"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <CartButton />
            </View>

            {deliveryActive ? (
              <TouchableOpacity
                className="mb-4 rounded-2xl border border-brand-primary bg-surface-card p-4"
                onPress={() => router.push("/order-tracking")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="small-bold text-brand-primary">AKTUÁLIS RENDELÉS</Text>
                    <Text className="paragraph-bold mt-1">Kiszállítás folyamatban</Text>
                    <Text className="body-medium mt-1 text-text-secondary">
                      {activeDeliveryStatus}
                    </Text>
                  </View>
                  <Image source={images.deliver} className="size-28 aspect-video mr-5" resizeMode="contain" />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        data={homeOffers}
        keyExtractor={(item) => String(item.id)}
        ListFooterComponent={() => (
          <View className="surface-card mt-4 mb-10 p-4">
            <Text className="paragraph-bold md:text-xl mb-3">Elérhetőségeink</Text>

            <View className="mb-3 flex-row items-start gap-3">
              <View className="icon-btn size-10 md:size-12">
                <Image source={images.location} className="size-8 md:size-10" resizeMode="contain" />
              </View>
              <View className="flex-1">
                <Text className="small-bold md:text-xl text-text-muted">CÍM</Text>
                <Text className="paragraph-semibold md:text-lg mt-1">4600 Kisvárda, Kölcsey utca 26.</Text>
              </View>
            </View>

            <View className="mb-3 flex-row items-start gap-3">
              <View className="icon-btn md:size-12">
                <Image source={images.phone} className="size-8 md:size-10" resizeMode="contain" />
              </View>
              <View className="flex-1">
                <Text className="small-bold md:text-xl text-text-muted">TELEFONSZÁM</Text>
                <Text className="paragraph-semibold md:text-lg mt-1">+36-45-500-150</Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="icon-btn md:size-10">
                <Image source={images.clock} className="size-8 md:size-10" resizeMode="contain" />
              </View>
              <View className="flex-1">
                <Text className="small-bold md:text-xl text-text-muted">NYITVATARTÁS</Text>
                <Text className="paragraph-semibold md:text-lg mt-1">Hétfő-Szombat: 9:00-22:00</Text>
                <Text className="paragraph-semibold md:text-lg">Vasárnap: 9:00-21:00</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerClassName="px-4 pb-28"
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;
          const cardDirectionClass = isEven ? "flex-row-reverse" : "flex-row";
          const textBlockClass = isEven
            ? "offer-card__info items-end"
            : "offer-card__info items-start";
          const textAlignClass = isEven ? "text-right" : "text-left";
          const imagePositionClass = isEven ? "left-0" : "right-0";

          return (
            <View
              className={cn("offer-card", cardDirectionClass)}
              style={{
                backgroundColor: item.gradient[0],
                height: isTablet ? 360 : 240,
              }}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              <View className="relative h-full w-[50%] overflow-hidden">
                <Image
                  source={item.image}
                  className={cn("absolute bottom-0 md:h-[100%] h-[90%] md:w-auto w-[100%]", imagePositionClass)}
                  resizeMode="cover"
                />
              </View>

              <View className={textBlockClass}>
                <Text
                  className={cn(
                    isTablet
                      ? "text-5xl font-quicksand-bold leading-tight text-text-inverse"
                      : "text-2xl font-quicksand-bold leading-tight text-text-inverse",
                    textAlignClass
                  )}
                >
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text className={cn(isTablet ? "paragraph-semibold text-3xl text-text-inverse" : "body-large text-text-inverse", textAlignClass)}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
          )
        }}
      />
    </SafeAreaView>
  );
}
