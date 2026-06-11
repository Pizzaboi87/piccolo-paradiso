import { appwriteConfig } from "@/lib/appwrite";
import { isRestaurantOpen } from "@/lib/opening-hours";
import { tokens } from "@/constants/tokens";
import useNavigationStore from "@/store/navigation.store";
import { MenuItem } from "@/type";
import { usePathname, useRouter } from "expo-router";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

const AdminProductCard = ({
    item: { $id, image_url, name, price, description },
    sourcePath,
}: {
    item: MenuItem;
    sourcePath?: string;
}) => {
    const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
    const router = useRouter();
    const pathname = usePathname();
    const pushSource = useNavigationStore((state) => state.pushSource);
    const openNow = isRestaurantOpen();

    return (
        <Pressable
            onPress={() => {
                pushSource(sourcePath || pathname || "/admin/edit-product");
                router.push(`/admin/edit-product-item/${$id}`);
            }}
            className="surface-card w-full flex-row items-stretch p-4"
            style={Platform.OS === "android" ? { elevation: 2, shadowColor: tokens.color.textPrimary } : {}}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${price} forint`}
            accessibilityHint="Megnyitja a termék szerkesztő oldalát."
        >
            <View className="flex-1 pr-4">
                <Text className="base-bold" numberOfLines={1}>
                    {name}
                </Text>
                <Text className="mt-1 base-semibold">{price} Ft</Text>
                <Text className="mt-2 body-regular leading-6" numberOfLines={3}>
                    {description}
                </Text>
            </View>

            <View className="relative w-32 justify-center">
                <Image
                    source={{ uri: imageUrl }}
                    className="h-32 w-32 rounded-2xl"
                    resizeMode="cover"
                    style={!openNow ? styles.grayscaleFilter : undefined}
                    accessible={false}
                />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    grayscaleFilter: { filter: [{ grayscale: 1 }] } as any,
});

export default AdminProductCard;
