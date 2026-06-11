import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants";
import { CustomHeaderProps } from "@/type";

const CustomHeader = ({ title, onBackPress, rightSlot }: CustomHeaderProps) => {
    const router = useRouter();

    return (
        <View className="custom-header">
            <TouchableOpacity
                onPress={onBackPress ?? (() => router.back())}
                className="icon-btn"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Vissza"
                accessibilityHint="Visszalépés az előző képernyőre."
            >
                <Image
                    source={images.arrowBack}
                    className="size-5"
                    resizeMode="contain"
                />
            </TouchableOpacity>

            {title ? <Text className="base-semibold">{title}</Text> : <View />}
            {rightSlot ?? <View className="touch-target" />}
        </View>
    );
};

export default CustomHeader;
