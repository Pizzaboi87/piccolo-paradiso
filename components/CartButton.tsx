import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import useNavigationStore from "@/store/navigation.store";
import { router, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View } from 'react-native';

type CartButtonProps = {
    sourcePath?: string;
};

const CartButton = ({ sourcePath }: CartButtonProps) => {
    const { getTotalItems } = useCartStore();
    const pushSource = useNavigationStore((state) => state.pushSource);
    const totalItems = getTotalItems();
    const pathname = usePathname();
    const effectiveFromPath = sourcePath || pathname || null;

    const handleOpenCart = () => {
        if (pathname === "/cart") return;

        pushSource(effectiveFromPath);
        router.push("/cart");
    };

    return (
        <TouchableOpacity
            className="cart-btn"
            onPress={handleOpenCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Kosár, ${totalItems} tétel`}
            accessibilityHint="Megnyitja a kosár képernyőt."
        >
            <Image source={images.bag} className="size-5" resizeMode="contain" />

            {totalItems > 0 && (
                <View className="cart-badge">
                    <Text className="small-bold text-text-inverse">{totalItems}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}
export default CartButton
