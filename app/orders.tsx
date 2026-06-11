import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import { getCurrentUserOrders } from "@/lib/appwrite";
import { OrderDocument, OrderLineItem } from "@/type";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatHuf = (value: number) => `${Math.round(value)} Ft`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusLabel = (status: string) => {
  if (status === "paid") return "Kifizetve";
  if (status === "pending") return "Folyamatban";
  if (status === "failed") return "Sikertelen";
  return status;
};

const getStatusClassName = (status: string) => {
  if (status === "paid") return "bg-brand-primary/15 text-brand-primary";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-surface-muted text-text-secondary";
};

const parseOrderItems = (itemsJson: string): OrderLineItem[] => {
  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? (parsed as OrderLineItem[]) : [];
  } catch {
    return [];
  }
};

const OrderCard = ({ order }: { order: OrderDocument }) => {
  const items = useMemo(() => parseOrderItems(order.itemsJson), [order.itemsJson]);
  const previewItems = items.slice(0, 3);
  const hasMoreItems = items.length > 3;
  const address = [order.city, order.street, order.houseNumber, order.floorDoor]
    .filter(Boolean)
    .join(", ");

  return (
    <View className="surface-card mb-4 p-4">
      <View className="flex-between flex-row">
        <Text className="paragraph-bold">#{order.orderId === "pending" ? order.$id.slice(-8) : order.orderId.slice(-12)}</Text>
        <Text className={`rounded-full px-3 py-1 text-xs font-quicksand-bold ${getStatusClassName(order.status)}`}>
          {getStatusLabel(order.status)}
        </Text>
      </View>

      <Text className="mt-1 body-regular">{formatDate(order.$createdAt)}</Text>

      <View className="mt-3 rounded-xl bg-surface-muted p-3">
        <Text className="paragraph-semibold">{order.customerName}</Text>
        <Text className="body-medium mt-1">{address}</Text>
        <Text className="body-medium">{order.phone}</Text>
      </View>

      <View className="mt-3 gap-2">
        {previewItems.map((item, idx) => (
          <View key={`${item.itemId}-${idx}`} className="flex-between flex-row">
            <Text className="paragraph-medium flex-1 pr-2" numberOfLines={1}>
              {item.quantity}x {item.name}
            </Text>
            <Text className="paragraph-semibold">{formatHuf(item.lineTotalHuf)}</Text>
          </View>
        ))}

        {hasMoreItems ? (
          <Text className="body-regular">+{items.length - 3} további tétel</Text>
        ) : null}
      </View>

      <View className="my-3 border-t border-border-subtle" />

      <View className="gap-1">
        <View className="flex-between flex-row">
          <Text className="paragraph-medium">Részösszeg</Text>
          <Text className="paragraph-semibold">{formatHuf(order.subtotalHuf)}</Text>
        </View>
        <View className="flex-between flex-row">
          <Text className="paragraph-medium">Kedvezmény</Text>
          <Text className="paragraph-semibold">- {formatHuf(order.discountHuf)}</Text>
        </View>
        <View className="flex-between flex-row">
          <Text className="paragraph-medium">Kiszállítás</Text>
          <Text className="paragraph-semibold">{formatHuf(order.deliveryFeeHuf)}</Text>
        </View>
        <View className="flex-between flex-row pt-1">
          <Text className="base-bold">Végösszeg</Text>
          <Text className="base-bold">{formatHuf(order.totalHuf)}</Text>
        </View>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const result = await getCurrentUserOrders();
      setOrders(result);
    } catch (e: any) {
      Alert.alert("Hiba", e?.message ?? "Nem sikerült betölteni a rendeléseket.");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadOrders();
      setIsLoading(false);
    };
    init();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  }, [loadOrders]);

  const showEmptyState = !isLoading && orders.length === 0;

  return (
    <SafeAreaView className="screen">
      <View className="px-5 pt-5">
        <CustomHeader title="Korábbi rendeléseim" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center px-5">
          <View className="surface-card w-full items-center p-6">
            <Text className="h3-bold text-center">Rendelések betöltése...</Text>
          </View>
        </View>
      ) : showEmptyState ? (
        <View className="flex-1 items-center justify-center px-4 pb-10">
          <View className="w-full items-center">
            <Image
              source={images.missing}
              className="h-44 w-44"
              resizeMode="contain"
            />
            <Text className="mt-5 text-center text-2xl font-quicksand-bold text-text-primary">
              Még nincs korábbi rendelésed
            </Text>
            <Text className="mt-2 max-w-[320px] text-center text-base font-quicksand text-text-secondary">
              Amint leadsz egy rendelést, itt kártyás nézetben látod majd az összes részletet.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerClassName="px-5 pb-10"
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}
