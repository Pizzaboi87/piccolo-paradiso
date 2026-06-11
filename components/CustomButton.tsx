import { CustomButtonProps } from "@/type";
import { tokens } from "@/constants/tokens";
import cn from "clsx";
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({
    onPress,
    title = "Kattints ide",
    style,
    textStyle,
    leftIcon,
    isLoading = false,
    loadingColor,
}: CustomButtonProps) => {
    return (
        <TouchableOpacity
            className={cn('custom-btn flex-center', style)}
            onPress={onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint="Koppints a művelet végrehajtásához."
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
        >
            {leftIcon}

            <View className="flex-center flex-row">
                {isLoading ? (
                    <ActivityIndicator
                        size="small"
                        color={loadingColor ?? tokens.color.textInverse}
                    />
                ) : (
                    <Text className={cn('custom-btn__text', textStyle)}>
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}
export default CustomButton
