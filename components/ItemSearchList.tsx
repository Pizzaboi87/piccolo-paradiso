import BottomSheetModal from "@/components/BottomSheetModal";
import Filter from "@/components/Filter";
import SearchBar from "@/components/SearchBar";
import { SkeletonItemCard } from "@/components/Skeleton";
import { images } from "@/constants";
import { getCategories, getItem } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { Category, MenuItem } from "@/type";
import cn from "clsx";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

type SortKey = "price_asc" | "price_desc" | "name_asc" | "name_desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "price_asc", label: "Ár szerint növekvő" },
    { key: "price_desc", label: "Ár szerint csökkenő" },
    { key: "name_asc", label: "Betűrend szerint A-Z" },
    { key: "name_desc", label: "Betűrend szerint Z-A" },
];

type ItemSearchListProps = {
    title: string;
    subtitle: string;
    headerRight?: ReactNode;
    renderCard: (item: MenuItem) => ReactNode;
    emptyText?: string;
};

export default function ItemSearchList({
    title,
    subtitle,
    headerRight,
    renderCard,
    emptyText = "Nincs találat",
}: ItemSearchListProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { category, query, sort } = useLocalSearchParams<{
        query?: string | string[];
        category?: string | string[];
        sort?: SortKey | SortKey[];
    }>();

    const resolvedCategory = Array.isArray(category) ? category[category.length - 1] : category;
    const resolvedQuery = Array.isArray(query) ? query[query.length - 1] : query;
    const resolvedSort = Array.isArray(sort) ? sort[sort.length - 1] : sort;

    const normalizedCategory = resolvedCategory === "all" ? "" : (resolvedCategory ?? "");
    const normalizedQuery = resolvedQuery ?? "";
    const normalizedSort: SortKey =
        resolvedSort && SORT_OPTIONS.some((option) => option.key === resolvedSort)
            ? (resolvedSort as SortKey)
            : "name_asc";

    const [activeSort, setActiveSort] = useState<SortKey>(normalizedSort);
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);

    const getItemsForSearch = useCallback(
        async (params: { category: string; query: string }) =>
            (await getItem(params)) as unknown as MenuItem[],
        []
    );

    const getCategoryList = useCallback(
        async (_params: Record<string, string | number>) =>
            (await getCategories()) as unknown as Category[],
        []
    );

    const { data, refetch, loading } = useAppwrite<MenuItem[], { category: string; query: string }>({
        fn: getItemsForSearch,
        params: { category: normalizedCategory, query: normalizedQuery },
    });

    const { data: categories } = useAppwrite<Category[], Record<string, string | number>>({
        fn: getCategoryList,
    });

    useEffect(() => {
        setActiveSort(normalizedSort);
    }, [normalizedSort]);

    useEffect(() => {
        refetch({ category: normalizedCategory, query: normalizedQuery });
    }, [normalizedCategory, normalizedQuery, refetch]);

    useFocusEffect(
        useCallback(() => {
            refetch({ category: normalizedCategory, query: normalizedQuery });
        }, [normalizedCategory, normalizedQuery, refetch])
    );

    const sortedData = useMemo(() => {
        const source = [...(data ?? [])];

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
    }, [data, activeSort]);

    const handleSortPress = (sortKey: SortKey) => {
        setActiveSort(sortKey);
        router.setParams({ sort: sortKey });
        setIsSortModalVisible(false);
    };

    const activeSortLabel = SORT_OPTIONS.find((option) => option.key === activeSort)?.label ?? "Betűrend szerint A-Z";

    return (
        <>
            <FlatList
                data={sortedData}
                renderItem={({ item }) => <>{renderCard(item)}</>}
                keyExtractor={(item) => item.$id}
                contentContainerClassName="gap-4 px-4 pb-32"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListHeaderComponent={() => (
                    <View className="mt-4 mb-0 gap-4">
                        <View className="flex-between flex-row w-full">
                            <View className="flex-start">
                                <Text className="small-bold uppercase text-brand-primary">{title}</Text>
                                <View className="mt-1 flex-start flex-row gap-x-1">
                                    <Text className={isTablet ? "base-semibold" : "paragraph-semibold"}>{subtitle}</Text>
                                </View>
                            </View>

                            {headerRight}
                        </View>

                        <SearchBar />
                        <Filter categories={categories ?? []} />

                        <View>
                            <TouchableOpacity
                                className="flex-row items-center justify-end"
                                onPress={() => setIsSortModalVisible(true)}
                                hitSlop={{ top: 0, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text className="medium-bold text-right text-text-secondary">
                                    Rendezés: {activeSortLabel}
                                </Text>
                                <Image
                                    source={activeSort.includes("asc") ? images.arrowUp : images.arrowDown}
                                    className="size-3 ml-1"
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => !loading && <Text className="body-regular text-center">{emptyText}</Text>}
                ListFooterComponent={() =>
                    loading ? (
                        <View className="gap-4 pb-2">
                            <SkeletonItemCard />
                            <SkeletonItemCard />
                            <SkeletonItemCard />
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
        </>
    );
}
