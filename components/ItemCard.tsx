import { appwriteConfig } from "@/lib/appwrite";
import { isRestaurantOpen } from "@/lib/opening-hours";
import { tokens } from "@/constants/tokens";
import useNavigationStore from "@/store/navigation.store";
import { MenuItem } from "@/type";
import { usePathname, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Pressable, Text, View } from 'react-native';

const ItemCard = ({ item: { $id, image_url, name, price, description } }: { item: MenuItem }) => {
    const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
    const router = useRouter();
    const pathname = usePathname();
    const pushSource = useNavigationStore((state) => state.pushSource);
    const openNow = isRestaurantOpen();

    const handleOpenItem = () => {
        pushSource(pathname);
        router.push(`/item/${$id}`);
    };

    return (
        <Pressable
            onPress={handleOpenItem}
            className="surface-card w-full flex-row items-stretch p-4"
            style={Platform.OS === 'android' ? { elevation: 2, shadowColor: tokens.color.textPrimary } : {}}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${price} forint`}
            accessibilityHint="Megnyitja a termék részleteit."
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
    )
}

const styles = StyleSheet.create({
    grayscaleFilter: { filter: [{ grayscale: 1 }] } as any,
});

export default ItemCard
