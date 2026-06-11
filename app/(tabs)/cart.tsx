import CartItem from '@/components/CartItem';
import CustomButton from "@/components/CustomButton";
import CustomHeader from '@/components/CustomHeader';
import { images } from "@/constants";
import { appwriteConfig } from "@/lib/appwrite";
import type { CheckoutOrderPayload } from "@/lib/checkout";
import {
    createPaymentSheetSession,
    getCheckoutValidationMessage,
    validateCheckoutProfile,
} from "@/lib/checkout";
import { calculateCartPricing } from "@/lib/promotions";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import useDeliveryStore from "@/store/delivery.store";
import useNavigationStore from "@/store/navigation.store";
import { CartItemType, PaymentInfoStripeProps } from '@/type';
import { useStripe } from "@stripe/stripe-react-native";
import cn from "clsx";
import { router } from "expo-router";
import { useState } from 'react';
import { Alert, FlatList, Image, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle, }: PaymentInfoStripeProps) => (
    <View className="flex-between flex-row my-1">
        <Text className={cn("paragraph-medium", labelStyle)}>
            {label}
        </Text>
        <Text className={cn("paragraph-bold", valueStyle)}>
            {value}
        </Text>
    </View>
);

const getCartItemKey = (item: CartItemType) => {
    const customizationsKey = (item.customizations ?? [])
        .map((c: { id: string }) => c.id)
        .sort()
        .join("|");
    const noteKey = (item.note ?? "").trim();
    return `${item.id}::${customizationsKey}::${noteKey}`;
};

const buildOrderPayload = ({
    userId,
    userFirstName,
    userLastName,
    phone,
    city,
    street,
    houseNumber,
    floorDoor,
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
}: {
    userId?: string;
    userFirstName?: string;
    userLastName?: string;
    phone?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    floorDoor?: string;
    items: CartItemType[];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
}): CheckoutOrderPayload => {
    const fullName = [userLastName?.trim(), userFirstName?.trim()]
        .filter(Boolean)
        .join(" ")
        .trim();

    const mappedItems = items.map((item) => {
        const mappedCustomizations = (item.customizations ?? []).map((customization) => ({
            id: customization.id,
            name: customization.name,
            type: customization.type,
            priceHuf: Math.round(customization.price),
        }));

        const customizationSum = mappedCustomizations.reduce(
            (sum, customization) => sum + customization.priceHuf,
            0
        );

        const unitBasePrice = Math.round(item.price);
        const lineTotal = (unitBasePrice + customizationSum) * item.quantity;

        return {
            itemId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitBasePriceHuf: unitBasePrice,
            customizations: mappedCustomizations,
            note: (item.note ?? "").trim(),
            lineTotalHuf: lineTotal,
            isPromoGift: item.isPromoGift,
            promoCode: item.promoCode,
        };
    });

    return {
        userId,
        customerName: fullName,
        phone: phone?.trim() ?? "",
        address: {
            city: city?.trim() ?? "",
            street: street?.trim() ?? "",
            houseNumber: houseNumber?.trim() ?? "",
            floorDoor: floorDoor?.trim() ?? "",
        },
        itemCount: mappedItems.reduce((sum, item) => sum + item.quantity, 0),
        items: mappedItems,
        pricing: {
            subtotalHuf: Math.round(subtotal),
            discountHuf: Math.round(discount),
            deliveryFeeHuf: Math.round(deliveryFee),
            totalHuf: Math.round(total),
        },
    };
};

const Cart = () => {
    const { items, getTotalItems, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const consumeBackTarget = useNavigationStore((state) => state.consumeBackTarget);
    const startDelivery = useDeliveryStore((state) => state.startDelivery);
    const isDeliveryInProgress = useDeliveryStore((state) => state.isDeliveryInProgress);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const totalItems = getTotalItems();
    const isEmpty = totalItems === 0;
    const { promotionalItems, subtotal, deliveryFee, discount, total, midweekDealActive, pairDealGiftQuantity } = calculateCartPricing(items);
    const displayItems = [...items, ...promotionalItems];

    const handleBackPress = () => {
        const targetPath = consumeBackTarget("/cart", "/");
        router.replace(targetPath as never);
    };

    const handleCheckout = async () => {
        if (isDeliveryInProgress()) {
            Alert.alert(
                "Aktív rendelés folyamatban",
                "Új rendelést akkor tudsz leadni, ha az előző kiszállítása befejeződött."
            );
            return;
        }

        const validation = validateCheckoutProfile(user);

        if (!validation.isValid) {
            Alert.alert(
                "Hiányzó adatok",
                getCheckoutValidationMessage(validation),
                [
                    { text: "Mégse", style: "cancel" },
                    { text: "Profil megnyitása", onPress: () => router.push("/profile") },
                ]
            );
            return;
        }

        if (!appwriteConfig.stripeCheckoutFunctionId) {
            Alert.alert(
                "Hiba a Stripe beállításokkal.",
                "Hiányzik az EXPO_PUBLIC_STRIPE_CHECKOUT_FUNCTION_ID változó."
            );
            return;
        }

        if (Math.round(total) < 175) {
            Alert.alert(
                "Túl alacsony összeg",
                "A Stripe minimum fizetési összeg HUF esetén 175 Ft."
            );
            return;
        }

        setIsCheckingOut(true);

        try {
            const orderPayload = buildOrderPayload({
                userId: user?.$id,
                userFirstName: user?.firstName,
                userLastName: user?.lastName,
                phone: user?.phone,
                city: user?.city,
                street: user?.street,
                houseNumber: user?.houseNumber,
                floorDoor: user?.floorDoor,
                items: displayItems,
                subtotal,
                discount,
                deliveryFee,
                total,
            });

            const session = await createPaymentSheetSession({
                amountHuf: Math.round(total),
                orderPayload,
            });

            const initResult = await initPaymentSheet({
                merchantDisplayName: appwriteConfig.stripeMerchantName || "Piccolo Paradiso Pizzéria",
                paymentIntentClientSecret: session.paymentIntentClientSecret,
                customerId: session.customerId,
                customerEphemeralKeySecret: session.customerEphemeralKeySecret,
                allowsDelayedPaymentMethods: false,
                style: "alwaysLight",
            });

            if (initResult.error) {
                throw new Error(initResult.error.message || "Nem sikerült inicializálni a fizetési képernyőt.");
            }

            const presentResult = await presentPaymentSheet();
            if (presentResult.error) {
                if (presentResult.error.code === "Canceled") {
                    return;
                }
                throw new Error(presentResult.error.message || "Sikertelen fizetés.");
            }

            const city = user?.city?.trim() || "Kisvárda";
            const street = user?.street?.trim() || "";
            const houseNumber = user?.houseNumber?.trim() || "";
            const floorDoor = user?.floorDoor?.trim() || "";
            const destinationAddress = [city, street, houseNumber, floorDoor, "Hungary"]
                .filter(Boolean)
                .join(", ");

            startDelivery(destinationAddress);
            clearCart();
            router.replace("/order-tracking");
            return;
        } catch (error: any) {
            const message = error?.message ?? "Nem sikerült elindítani a Stripe fizetést.";

            if (String(message).includes("/payment-sheet")) {
                Alert.alert(
                    "Stripe backend hiányzik",
                    "A natív fizetéshez a function-ben kell egy /payment-sheet endpoint, ami visszaad paymentIntentClientSecret-et."
                );
                return;
            }

            Alert.alert(
                "Fizetési hiba",
                message
            );
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <SafeAreaView className="screen">
            <FlatList
                data={displayItems}
                renderItem={({ item }) => <CartItem item={item} />}
                keyExtractor={getCartItemKey}
                contentContainerStyle={{
                    paddingBottom: 112,
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    flexGrow: isEmpty ? 1 : 0,
                }}
                ListHeaderComponent={() => <CustomHeader title="Kosár Tartalma" onBackPress={handleBackPress} />}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center px-4 pb-16">
                        <View className="w-full items-center">
                            <Image source={images.empty} className="size-44" resizeMode="contain" />
                            <Text className={cn("mt-5 text-center font-quicksand-bold text-text-primary", isTablet ? "text-4xl" : "text-3xl")}>
                                A kosarad üres
                            </Text>
                            <Text
                                className={cn(
                                    "mt-3 text-center font-quicksand text-text-secondary",
                                    isTablet ? "text-2xl leading-8" : "text-lg"
                                )}
                                style={isTablet ? { maxWidth: 520 } : undefined}
                            >
                                Nézz körül az ételek között, és tedd a
                                kedvenceidet a kosárba a rendeléshez.
                            </Text>

                            <View className={cn("mt-8", isTablet ? "w-1/2 min-w-64 max-w-80" : "w-full")}>
                                <CustomButton title="Nézzünk ételeket" onPress={() => router.push("/search")} />
                            </View>
                        </View>
                    </View>
                )}
                ListFooterComponent={() => totalItems > 0 && (
                    <View className="gap-5">
                        <View className="surface-card mt-6 p-5">
                            <Text className="h3-bold mb-5">
                                Rendelésed összegzése
                            </Text>

                            <PaymentInfoStripe
                                label={`Tételek összesen (${totalItems} db)`}
                                value={`${subtotal.toFixed(0)} Ft`}
                            />
                            {pairDealGiftQuantity > 0 && (
                                <PaymentInfoStripe
                                    label={`Páros akció ajándék (${pairDealGiftQuantity} db)`}
                                    value="0 Ft"
                                    valueStyle="!text-status-success"
                                />
                            )}
                            <PaymentInfoStripe
                                label={`Kiszállítási díj`}
                                value={`${deliveryFee} Ft`}
                                valueStyle="!text-status-success"
                            />
                            <PaymentInfoStripe
                                label={midweekDealActive ? "Kedvezmény (Midweek Deal)" : "Kedvezmény"}
                                value={discount ? `- ${discount} Ft` : "0 Ft"}
                                valueStyle="!text-status-success"
                            />
                            <View className="my-2 border-t border-border-strong" />
                            <PaymentInfoStripe
                                label={`Végösszeg`}
                                value={`${total.toFixed(0)} Ft`}
                                labelStyle="base-bold"
                                valueStyle="base-bold !text-right"
                            />
                        </View>

                        <CustomButton
                            title={isDeliveryInProgress() ? "Aktív rendelés folyamatban" : "Rendelés leadása"}
                            onPress={handleCheckout}
                            isLoading={isCheckingOut}
                            style={isDeliveryInProgress() ? "bg-surface-muted border border-border-strong" : undefined}
                            textStyle={isDeliveryInProgress() ? "text-text-muted" : undefined}
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default Cart
