import BottomSheetModal from "@/components/BottomSheetModal";
import CartButton from "@/components/CartButton";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { appwriteConfig, getCustomizationsByCategory, getItemById } from "@/lib/appwrite";
import { isRestaurantOpen } from "@/lib/opening-hours";
import useAppwrite from "@/lib/useAppwrite";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import { useCartStore } from "@/store/cart.store";
import useNavigationStore from "@/store/navigation.store";
import { CartCustomization, Customization, MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ItemParams = { id: string };
type CategoryParams = { categoryId: string };

const areCustomizationsEqual = (
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean => {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
};

const buildSelectionKey = (itemId: string, customizations: CartCustomization[], note: string) => {
    const customizationIds = [...customizations].map((c) => c.id).sort().join("|");
    return `${itemId}::${customizationIds}::${note.trim()}`;
};

const getCategoryIdFromItem = (item: MenuItem | null): string => {
    if (!item?.category) return "";
    if (typeof item.category === "string") return item.category;
    return item.category.$id ?? "";
};

const ItemDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addItem, decreaseQty, increaseQty, items } = useCartStore();
    const consumeBackTarget = useNavigationStore((state) => state.consumeBackTarget);

    const [selectedSizeId, setSelectedSizeId] = useState("");
    const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
    const [selectedSideIds, setSelectedSideIds] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");

    const [activePicker, setActivePicker] = useState<"size" | "topping" | "side" | null>(null);
    const [addedSelectionKey, setAddedSelectionKey] = useState<string | null>(null);
    const [isRestaurantOpenNow, setIsRestaurantOpenNow] = useState(() => isRestaurantOpen());
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const heroHeight = isLandscape
        ? Math.max(200, Math.round(screenHeight * 0.6))
        : Math.max(260, Math.min(420, Math.round(screenHeight * 0.42)));
    const insets = useSafeAreaInsets();
    const { isKeyboardVisible, registerScrollRef, scrollToBottomOnFocus } = useKeyboardAwareScroll();

    const getItemForScreen = async (params: ItemParams) =>
        (await getItemById(params)) as unknown as MenuItem;

    const getCustomizationsForScreen = async (params: CategoryParams) =>
        (await getCustomizationsByCategory(params)) as unknown as Customization[];

    const { data: item, loading: itemLoading } = useAppwrite<MenuItem, ItemParams>({
        fn: getItemForScreen,
        params: { id: id ?? "" },
        skip: !id,
    });

    const {
        data: customizations,
        refetch: refetchCustomizations,
        loading: customizationLoading,
    } = useAppwrite<Customization[], CategoryParams>({
        fn: getCustomizationsForScreen,
        params: { categoryId: "" },
        skip: true,
    });

    useEffect(() => {
        setSelectedSizeId("");
        setSelectedToppingIds([]);
        setSelectedSideIds([]);
        setQuantity(1);
        setNote("");
        setAddedSelectionKey(null);
    }, [id]);

    useEffect(() => {
        const categoryId = getCategoryIdFromItem(item ?? null);
        if (categoryId) refetchCustomizations({ categoryId });
    }, [item, refetchCustomizations]);

    useEffect(() => {
        const updateOpenState = () => setIsRestaurantOpenNow(isRestaurantOpen());

        updateOpenState();
        const timer = setInterval(updateOpenState, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const imageUrl = useMemo(() => {
        if (!item?.image_url) return "";
        return `${item.image_url}?project=${appwriteConfig.projectId}`;
    }, [item?.image_url]);

    const sizes = (customizations ?? []).filter((c) => c.type === "size");
    const toppings = (customizations ?? []).filter((c) => c.type === "topping");
    const sides = (customizations ?? []).filter((c) => c.type === "side");
    const hasCustomizations = sizes.length > 0 || toppings.length > 0 || sides.length > 0;

    useEffect(() => {
        if (sizes.length === 0) return;
        const hasValidSelectedSize = sizes.some((size) => size.$id === selectedSizeId);
        if (hasValidSelectedSize) return;

        const defaultSize = sizes.find((size) => size.name.toLowerCase() === "kicsi") ?? sizes[0];
        setSelectedSizeId(defaultSize.$id);
    }, [sizes, selectedSizeId]);

    const toggleFromSelection = (
        current: string[],
        idToToggle: string,
        setter: (next: string[]) => void
    ) => {
        if (current.includes(idToToggle)) {
            setter(current.filter((id) => id !== idToToggle));
            return;
        }
        setter([...current, idToToggle]);
    };

    const selectedCustomizations = useMemo(() => {
        if (!customizations) return [];

        const selectedIds = new Set([selectedSizeId, ...selectedToppingIds, ...selectedSideIds]);

        return customizations
            .filter((customization) => selectedIds.has(customization.$id))
            .map(
                (customization): CartCustomization => ({
                    id: customization.$id,
                    name: customization.name,
                    price: customization.price,
                    type: customization.type,
                })
            );
    }, [customizations, selectedSizeId, selectedToppingIds, selectedSideIds]);

    const selectedExtrasTotal = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
    const finalUnitPrice = item ? item.price + selectedExtrasTotal : 0;
    const finalTotalPrice = finalUnitPrice * quantity;
    const canAddToCart = !hasCustomizations || Boolean(selectedSizeId);
    const trimmedNote = note.trim();
    const currentSelectionKey = useMemo(
        () => buildSelectionKey(item?.$id ?? "", selectedCustomizations, trimmedNote),
        [item?.$id, selectedCustomizations, trimmedNote]
    );
    const currentSelectionQuantityInCart = useMemo(() => {
        if (!item) return 0;
        const current = items.find(
            (cartItem) =>
                cartItem.id === item.$id &&
                areCustomizationsEqual(cartItem.customizations ?? [], selectedCustomizations) &&
                (cartItem.note ?? "").trim() === trimmedNote
        );

        return current?.quantity ?? 0;
    }, [item, items, selectedCustomizations, trimmedNote]);
    const isCurrentSelectionAdded =
        addedSelectionKey === currentSelectionKey && currentSelectionQuantityInCart > 0;

    const handleAddToCart = () => {
        if (!item || !canAddToCart || !isRestaurantOpenNow) return;

        for (let i = 0; i < quantity; i += 1) {
            addItem({
                id: item.$id,
                name: item.name,
                price: item.price,
                image_url: imageUrl,
                customizations: selectedCustomizations,
                note: trimmedNote,
            });
        }
        setAddedSelectionKey(currentSelectionKey);
    };

    const openPicker = (picker: "size" | "topping" | "side") => {
        setActivePicker(picker);
    };

    const closePicker = () => {
        setActivePicker(null);
    };

    const selectedSize = sizes.find((size) => size.$id === selectedSizeId);
    const selectedToppings = toppings.filter((topping) => selectedToppingIds.includes(topping.$id));
    const selectedSides = sides.filter((side) => selectedSideIds.includes(side.$id));

    const summaryFor = (type: "size" | "topping" | "side") => {
        if (type === "size") {
            return selectedSize ? `${selectedSize.name} (+${selectedSize.price} Ft)` : "Válassz méretet";
        }
        if (type === "topping") {
            return selectedToppings.length > 0 ? `${selectedToppings.length} kiválasztva` : "Nincs kiválasztva";
        }
        return selectedSides.length > 0 ? `${selectedSides.length} kiválasztva` : "Nincs kiválasztva";
    };

    const handleBackPress = () => {
        const currentPath = id ? `/item/${id}` : "/item";
        const targetPath = consumeBackTarget(currentPath, "/search");
        router.replace(targetPath as never);
    };

    if (itemLoading) {
        return (
            <SafeAreaView className="screen">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={tokens.color.brandPrimary} />
                    <Text className="mt-3 body-regular">Betöltés...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!item) {
        return (
            <SafeAreaView className="screen">
                <View className="px-5 pt-5">
                    <CustomHeader
                        title="Étel"
                        onBackPress={handleBackPress}
                        rightSlot={<CartButton sourcePath={id ? `/item/${id}` : undefined} />}
                    />
                    <View className="mt-10 items-center">
                        <Text className="base-semibold">A kiválasztott étel nem található.</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="screen" edges={["left", "right", "bottom"]}>
            <View className="flex-1">
                <AppKeyboardAwareScrollView
                    ref={registerScrollRef}
                    contentContainerClassName="px-5"
                    contentContainerStyle={{
                        paddingBottom: 160,
                    }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    extraKeyboardSpace={24}
                    bottomOffset={12}
                >
                    <View
                        className="relative"
                        style={{ marginHorizontal: -20, height: heroHeight }}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            className="size-full"
                            resizeMode="cover"
                            style={!isRestaurantOpenNow ? ({ filter: [{ grayscale: 1 }] } as any) : undefined}
                        />
                        <View
                            className="absolute left-5 right-5 z-20 flex-row items-center justify-between"
                            style={{ top: insets.top + 8 }}
                        >
                            <Pressable
                                onPress={handleBackPress}
                                className="icon-btn"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityRole="button"
                                accessibilityLabel="Vissza"
                                accessibilityHint="Visszalépés az előző képernyőre."
                            >
                                <Image source={images.arrowBack} className="size-5" resizeMode="contain" />
                            </Pressable>
                            <CartButton sourcePath={id ? `/item/${id}` : undefined} />
                        </View>
                    </View>

                    <View className="surface-card mt-5 p-5">
                        <Text className="h3-bold">{item.name}</Text>
                        <Text className="mt-2 body-regular">{item.description}</Text>
                        <Text className="mt-4 h3-bold">Induló ár: {item.price} Ft</Text>
                    </View>

                    {customizationLoading ? (
                        <Text className="mt-6 body-regular">Extrák betöltése...</Text>
                    ) : (
                        <View className="mt-4 gap-4">
                            {sizes.length > 0 && (
                                <Pressable
                                    className="surface-card px-5 py-4"
                                    onPress={() => openPicker("size")}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Méret kiválasztása, ${summaryFor("size")}`}
                                >
                                    <Text className="h3-bold">Válassz méretet</Text>
                                    <Text className="mt-2 body-medium text-brand-primary">Kötelező választás</Text>
                                    <View className="mt-3 flex-row items-center justify-between">
                                        <Text className="base-semibold">{summaryFor("size")}</Text>
                                        <Text className="text-3xl font-quicksand-bold leading-none text-text-secondary">›</Text>
                                    </View>
                                </Pressable>
                            )}

                            {toppings.length > 0 && (
                                <Pressable
                                    className="surface-card px-5 py-4"
                                    onPress={() => openPicker("topping")}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Feltét kiválasztása, ${summaryFor("topping")}`}
                                >
                                    <Text className="h3-bold">Plusz feltétek</Text>
                                    <Text className="mt-2 body-regular">Többet is választhatsz</Text>
                                    <View className="mt-3 flex-row items-center justify-between">
                                        <Text className="base-semibold">{summaryFor("topping")}</Text>
                                        <Text className="text-3xl font-quicksand-bold leading-none text-text-secondary">›</Text>
                                    </View>
                                </Pressable>
                            )}

                            {sides.length > 0 && (
                                <Pressable
                                    className="surface-card px-5 py-4"
                                    onPress={() => openPicker("side")}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Szósz kiválasztása, ${summaryFor("side")}`}
                                >
                                    <Text className="h3-bold">Szószok</Text>
                                    <Text className="mt-2 body-regular">Többet is választhatsz</Text>
                                    <View className="mt-3 flex-row items-center justify-between">
                                        <Text className="base-semibold">{summaryFor("side")}</Text>
                                        <Text className="text-3xl font-quicksand-bold leading-none text-text-secondary">›</Text>
                                    </View>
                                </Pressable>
                            )}

                            {!hasCustomizations && (
                                <View className="surface-card p-5">
                                    <Text className="body-regular">Ehhez az ételhez nem érhető el extra opció.</Text>
                                </View>
                            )}

                            <View className="surface-card px-5 py-4">
                                <Text className="h3-bold">Megjegyzés</Text>
                                <Text className="mt-2 body-regular">Ide írhatsz különleges kérést.</Text>
                                <TextInput
                                    value={note}
                                    onChangeText={setNote}
                                    onFocus={scrollToBottomOnFocus}
                                    placeholder="Pl.: vágják 3 felé, extra ropogósra kérném..."
                                    placeholderTextColor={tokens.color.textMuted}
                                    multiline
                                    textAlignVertical="top"
                                    className="mt-3 min-h-24 rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3 text-text-primary"
                                />
                            </View>
                        </View>
                    )}
                </AppKeyboardAwareScrollView>

                {!isKeyboardVisible && (
                    <View className="absolute bottom-0 left-0 right-0 border-t border-border-subtle bg-surface-card px-5 pb-8 pt-4">
                        {!isRestaurantOpenNow ? (
                            <View className="h-12 w-full items-center justify-center rounded-2xl border border-status-error/30 bg-status-error/10">
                                <Text className="paragraph-semibold text-status-error">
                                    Éttermünk jelenleg zárva tart.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View className="flex-row items-center gap-4">
                                    {!isCurrentSelectionAdded && (
                                        <View className="flex-row items-center rounded-2xl bg-surface-muted px-3 py-2">
                                            <Pressable
                                                className="touch-target items-center justify-center rounded-xl bg-surface-card"
                                                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Text className="text-2xl font-quicksand-bold leading-none text-text-primary">-</Text>
                                            </Pressable>
                                            <Text className="base-bold min-w-8 text-center">{quantity}</Text>
                                            <Pressable
                                                className="touch-target items-center justify-center rounded-xl bg-surface-card"
                                                onPress={() => setQuantity((prev) => prev + 1)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Text className="text-2xl font-quicksand-bold leading-none text-text-primary">+</Text>
                                            </Pressable>
                                        </View>
                                    )}

                                    <View className="flex-1">
                                        {isCurrentSelectionAdded ? (
                                            <View className="flex-row items-center justify-between rounded-2xl bg-brand-primary/10 px-4 py-2">
                                                <Text className="paragraph-semibold text-brand-primary">Kosárban</Text>
                                                <View className="flex-row items-center gap-3">
                                                    <Pressable
                                                        className="touch-target items-center justify-center rounded-xl bg-surface-card"
                                                        onPress={() => {
                                                            if (!item) return;
                                                            decreaseQty(item.$id, selectedCustomizations, trimmedNote);
                                                        }}
                                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                    >
                                                        <Text className="text-2xl font-quicksand-bold leading-none text-text-primary">-</Text>
                                                    </Pressable>
                                                    <Text className="base-bold min-w-8 text-center">{currentSelectionQuantityInCart}</Text>
                                                    <Pressable
                                                        className="touch-target items-center justify-center rounded-xl bg-surface-card"
                                                        onPress={() => {
                                                            if (!item) return;
                                                            increaseQty(item.$id, selectedCustomizations, trimmedNote);
                                                        }}
                                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                    >
                                                        <Text className="text-2xl font-quicksand-bold leading-none text-text-primary">+</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        ) : (
                                            <CustomButton title={`Kosárba teszem - ${finalTotalPrice} Ft`} onPress={handleAddToCart} />
                                        )}
                                    </View>
                                </View>
                                {sizes.length > 0 && !selectedSizeId && (
                                    <Text className="mt-2 body-regular text-status-error">Kérlek válassz méretet.</Text>
                                )}
                            </>
                        )}
                    </View>
                )}

                <BottomSheetModal
                    visible={Boolean(activePicker)}
                    onClose={closePicker}
                    title={activePicker === "size" ? "Válassz méretet" : activePicker === "topping" ? "Plusz feltétek" : "Szószok"}
                    mandatoryLabel={activePicker === "size" ? "Kötelező választás" : undefined}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {(activePicker === "size" ? sizes : activePicker === "topping" ? toppings : sides).map((option, index, arr) => {
                            const active =
                                activePicker === "size"
                                    ? selectedSizeId === option.$id
                                    : activePicker === "topping"
                                        ? selectedToppingIds.includes(option.$id)
                                        : selectedSideIds.includes(option.$id);

                            const onPressOption = () => {
                                if (activePicker === "size") {
                                    setSelectedSizeId(option.$id);
                                    closePicker();
                                    return;
                                }
                                if (activePicker === "topping") {
                                    toggleFromSelection(selectedToppingIds, option.$id, setSelectedToppingIds);
                                    return;
                                }
                                toggleFromSelection(selectedSideIds, option.$id, setSelectedSideIds);
                            };

                            return (
                                <Pressable
                                    key={option.$id}
                                    onPress={onPressOption}
                                    className={`flex-row items-center justify-between py-4 ${index !== arr.length - 1 ? "border-b border-border-subtle" : ""}`}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View
                                            className={`size-6 items-center justify-center ${activePicker === "size" ? "rounded-full" : "rounded-md"} border-2 ${active ? "border-brand-primary bg-brand-primary" : "border-border-strong"}`}
                                        >
                                            {activePicker === "size" ? (
                                                active && <View className="size-3 rounded-full bg-text-inverse" />
                                            ) : (
                                                active && <Text className="small-bold text-text-inverse">✓</Text>
                                            )}
                                        </View>
                                        <View>
                                            <Text className="base-semibold">{option.name}</Text>
                                            <Text className="body-regular">+{option.price} Ft</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {activePicker !== "size" && (
                        <View className="mt-4">
                            <CustomButton title="Kész" onPress={closePicker} />
                        </View>
                    )}
                </BottomSheetModal>
            </View>
        </SafeAreaView>
    );
};

export default ItemDetails;
