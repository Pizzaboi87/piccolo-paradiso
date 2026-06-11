import { CustomInputProps } from '@/type';
import { tokens } from "@/constants/tokens";
import cn from "clsx";
import { useState } from "react";
import { Text, TextInput, View } from 'react-native';

const CustomInput = ({
    placeholder = 'Adj meg szöveget',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = "default"
}: CustomInputProps) => {
    const [isFocused, setIsFocused] = useState(false);


    return (
        <View className="w-full">
            <Text className="label">{label}</Text>

            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor={tokens.color.textMuted}
                className={cn('input', isFocused ? 'border-brand-primary' : 'border-border-strong')}
            />
        </View>
    )
}
export default CustomInput
