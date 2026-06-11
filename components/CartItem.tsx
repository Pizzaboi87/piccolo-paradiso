import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty } = useCartStore();
    const isPromoGift = Boolean(item.isPromoGift);
    const selectedExtras = item.customizations ?? [];
    const selectedExtrasPrice = selectedExtras.reduce((sum, c) => sum + c.price, 0);
    const unitPrice = item.price + selectedExtrasPrice;
    const selectedExtrasText = selectedExtras.map((c) => c.name).join(", ");

    return (
        <View className="cart-item">
            <View className="cart-item__image">
                <Image
                    source={{ uri: item.image_url }}
                    className="size-4/5 rounded-lg"
                    resizeMode="cover"
                />
            </View>

            <View className="ml-auto min-h-32 w-full max-w-[62%] items-end justify-between pr-2">
                <View className="items-end">
                    <Text className="base-bold text-right">{item.name}</Text>
                    <Text className="mt-1 paragraph-bold text-right text-brand-primary">
                        {unitPrice} Ft
                    </Text>
                    {isPromoGift && (
                        <Text className="mt-1 body-medium text-status-success">
                            Automatikus ajándék
                        </Text>
                    )}
                    {selectedExtras.length > 0 && (
                        <Text className="body-regular mt-1 text-right" numberOfLines={2}>
                            {selectedExtrasText}
                        </Text>
                    )}
                </View>

                {isPromoGift ? (
                    <View className="mt-3 rounded-xl bg-brand-primary/10 px-3 py-2">
                        <Text className="paragraph-semibold text-brand-primary">{item.quantity} db</Text>
                    </View>
                ) : (
                    <View className="mt-3 flex flex-row items-center gap-x-4">
                        <TouchableOpacity
                            onPress={() => decreaseQty(item.id, item.customizations!, item.note)}
                            className="cart-item__actions"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel={`${item.name} mennyiség csökkentése`}
                            accessibilityHint="Egy darabbal csökkenti a termék mennyiségét."
                        >
                            <Image
                                source={images.minus}
                                className="size-5"
                                resizeMode="contain"
                                tintColor={tokens.color.brandPrimary}
                            />
                        </TouchableOpacity>

                        <Text className="base-bold">{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={() => increaseQty(item.id, item.customizations!, item.note)}
                            className="cart-item__actions"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel={`${item.name} mennyiség növelése`}
                            accessibilityHint="Egy darabbal növeli a termék mennyiségét."
                        >
                            <Image
                                source={images.plus}
                                className="size-5"
                                resizeMode="contain"
                                tintColor={tokens.color.brandPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default CartItem;
