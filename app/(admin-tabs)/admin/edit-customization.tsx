import BottomSheetModal from "@/components/BottomSheetModal";
import SearchBar from "@/components/SearchBar";
import { SkeletonCustomizationRow } from "@/components/Skeleton";
import { images } from "@/constants";
import { getCustomizations } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import useNavigationStore from "@/store/navigation.store";
import { Customization } from "@/type";
import cn from "clsx";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SortKey = "price_asc" | "price_desc" | "name_asc" | "name_desc";
type CustomizationType = "size" | "topping" | "side";

const TYPE_OPTIONS: { key: CustomizationType; label: string }[] = [
  { key: "size", label: "Méretek" },
  { key: "topping", label: "Feltétek" },
  { key: "side", label: "Szószok" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price_asc", label: "Ár szerint növekvő" },
  { key: "price_desc", label: "Ár szerint csökkenő" },
  { key: "name_asc", label: "Betűrend szerint A-Z" },
  { key: "name_desc", label: "Betűrend szerint Z-A" },
];

const TYPE_NAME: Record<CustomizationType, string> = {
  size: "Méret",
  topping: "Feltét",
  side: "Szósz",
};

export default function AdminEditCustomizationScreen() {
  const { query, type, sort } = useLocalSearchParams<{
    query?: string | string[];
    type?: CustomizationType | CustomizationType[];
    sort?: SortKey | SortKey[];
  }>();

  const pushSource = useNavigationStore((state) => state.pushSource);

  const resolvedQuery = Array.isArray(query) ? query[query.length - 1] : query;
  const resolvedType = Array.isArray(type) ? type[type.length - 1] : type;
  const resolvedSort = Array.isArray(sort) ? sort[sort.length - 1] : sort;

  const normalizedQuery = (resolvedQuery ?? "").trim().toLowerCase();
  const normalizedType: CustomizationType =
    resolvedType && TYPE_OPTIONS.some((option) => option.key === resolvedType)
      ? (resolvedType as CustomizationType)
      : "size";
  const normalizedSort: SortKey =
    resolvedSort && SORT_OPTIONS.some((option) => option.key === resolvedSort)
      ? (resolvedSort as SortKey)
      : "price_asc";

  const [activeType, setActiveType] = useState<CustomizationType>(normalizedType);
  const [activeSort, setActiveSort] = useState<SortKey>(normalizedSort);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const fetchCustomizations = useCallback(
    async (_params: Record<string, string | number>) =>
      (await getCustomizations()) as unknown as Customization[],
    []
  );

  const { data, loading, refetch } = useAppwrite<Customization[], Record<string, string | number>>({
    fn: fetchCustomizations,
    params: {},
  });

  useEffect(() => {
    setActiveType(normalizedType);
  }, [normalizedType]);

  useEffect(() => {
    setActiveSort(normalizedSort);
  }, [normalizedSort]);

  useFocusEffect(
    useCallback(() => {
      refetch({});
    }, [refetch])
  );

  const filteredAndSorted = useMemo(() => {
    const source = [...(data ?? [])].filter(
      (item) =>
        item.type === activeType &&
        (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery))
    );

    switch (activeSort) {
      case "price_desc":
        return source.sort((a, b) => b.price - a.price);
      case "name_asc":
        return source.sort((a, b) => a.name.localeCompare(b.name, "hu"));
      case "name_desc":
        return source.sort((a, b) => b.name.localeCompare(a.name, "hu"));
      case "price_asc":
      default:
        return source.sort((a, b) => a.price - b.price);
    }
  }, [data, activeType, activeSort, normalizedQuery]);

  const activeSortLabel = SORT_OPTIONS.find((option) => option.key === activeSort)?.label ?? "Ár szerint növekvő";

  const handleTypePress = (value: CustomizationType) => {
    setActiveType(value);
    router.setParams({ type: value });
  };

  const handleSortPress = (value: SortKey) => {
    setActiveSort(value);
    router.setParams({ sort: value });
    setIsSortModalVisible(false);
  };

  return (
    <SafeAreaView className="screen">
      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="gap-3 px-4 pb-32"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <Pressable
            className="surface-card px-4 py-4"
            onPress={() => {
              pushSource("/admin/edit-customization");
              router.push(`/admin/edit-customization-item/${item.$id}`);
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="base-bold">{item.name}</Text>
              <Text className="base-semibold">{item.price} Ft</Text>
            </View>
            <Text className="mt-1 body-medium text-text-secondary">{TYPE_NAME[item.type]}</Text>
          </Pressable>
        )}
        ListHeaderComponent={() => (
          <View className="mt-4 mb-0 gap-4">
            <View className="flex-start">
              <Text className="small-bold uppercase text-brand-primary">Feltét szerkesztése</Text>
              <Text className="mt-1 paragraph-semibold">Válassz feltétet szerkesztéshez</Text>
            </View>

            <SearchBar isCustomization />

            <View className="flex-row gap-2">
              {TYPE_OPTIONS.map((option) => {
                const selected = activeType === option.key;
                return (
                  <Pressable
                    key={option.key}
                    className={cn(
                      "h-12 flex-1 items-center justify-center rounded-2xl border",
                      selected
                        ? "border-brand-primary bg-brand-primary"
                        : "border-border-subtle bg-surface-card"
                    )}
                    onPress={() => handleTypePress(option.key)}
                  >
                    <Text
                      className={cn(
                        "paragraph-semibold",
                        selected ? "text-text-inverse" : "text-text-secondary"
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <TouchableOpacity
                className="flex-row items-center justify-end"
                onPress={() => setIsSortModalVisible(true)}
                hitSlop={{ top: 0, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="medium-bold text-right text-text-secondary">Rendezés: {activeSortLabel}</Text>
                <Image
                  source={activeSort.includes("asc") ? images.arrowUp : images.arrowDown}
                  className="ml-1 size-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          !loading && <Text className="body-regular text-center">Nincs találat</Text>
        }
        ListFooterComponent={() =>
          loading ? (
            <View className="gap-3 pb-2">
              <SkeletonCustomizationRow />
              <SkeletonCustomizationRow />
              <SkeletonCustomizationRow />
            </View>
          ) : null
        }
      />

      <BottomSheetModal
        visible={isSortModalVisible}
        onClose={() => setIsSortModalVisible(false)}
        title="Rendezés"
      >
        <View>
          {SORT_OPTIONS.map((option, index) => {
            const selected = activeSort === option.key;
            return (
              <Pressable
                key={option.key}
                className={cn(
                  "flex-row items-center justify-between py-4",
                  index !== SORT_OPTIONS.length - 1 ? "border-b border-border-subtle" : ""
                )}
                onPress={() => handleSortPress(option.key)}
              >
                <Text className="base-semibold">{option.label}</Text>
                {selected ? <Text className="paragraph-semibold text-brand-primary">Kiválasztva</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
