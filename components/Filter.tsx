import { Category } from "@/type";
import { tokens } from "@/constants/tokens";
import cn from "clsx";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Text, TouchableOpacity } from 'react-native';

const scrollOffsetByPath: Record<string, number> = {};

const Filter = ({ categories }: { categories: Category[] }) => {
    const pathname = usePathname();
    const searchParams = useLocalSearchParams();
    const currentCategoryParam = useMemo(() => {
        const value = searchParams.category;
        if (Array.isArray(value)) return value[value.length - 1] ?? "all";
        return value ?? "all";
    }, [searchParams.category]);
    const [active, setActive] = useState(currentCategoryParam);

    useEffect(() => {
        setActive(currentCategoryParam);
    }, [currentCategoryParam]);

    const handlePress = (id: string) => {
        setActive(id);

        if (id === "all") {
            router.setParams({ category: "all" });
            return;
        }

        router.setParams({ category: id });
    };

    const filterData: (Category | { $id: string; name: string })[] = categories
        ? [{ $id: 'all', name: 'Összes' }, ...categories]
        : [{ $id: 'all', name: 'Összes' }]
    const initialOffset = scrollOffsetByPath[pathname] ?? 0;

    return (
        <FlatList
            data={filterData}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-x-2 pb-3"
            contentOffset={initialOffset > 0 ? { x: initialOffset, y: 0 } : undefined}
            onScroll={(event) => {
                scrollOffsetByPath[pathname] = event.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
                <TouchableOpacity
                    key={item.$id}
                    className={cn('filter', active === item.$id ? 'bg-brand-primary border-brand-primary' : 'bg-surface-card border-border-subtle')}
                    style={Platform.OS === 'android' ? { elevation: 1, shadowColor: tokens.color.textPrimary } : {}}
                    onPress={() => handlePress(item.$id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name} kategória`}
                    accessibilityHint="Szűri a listát a kiválasztott kategóriára."
                    accessibilityState={{ selected: active === item.$id }}
                >
                    <Text className={cn('paragraph-medium', active === item.$id ? 'text-text-inverse' : 'text-text-secondary')}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
    )
}
export default Filter
