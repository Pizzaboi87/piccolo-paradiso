import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

const SearchBar = ({ isCustomization = false }: { isCustomization?: boolean }) => {
    const params = useLocalSearchParams<{ query: string }>();
    const [query, setQuery] = useState(params.query);

    const handleSearch = (text: string) => {
        setQuery(text);

        if (!text) router.setParams({ query: undefined });
    };

    const handleSubmit = () => {
        if (query.trim()) router.setParams({ query });
    }

    return (
        <View className="searchbar">
            <TextInput
                className="h-12 flex-1 px-3 text-base font-quicksand-medium text-text-primary"
                placeholder={isCustomization ? "Keress feltétre, szószra..." : "Keress pizzára, tésztára..."}
                value={query}
                onChangeText={handleSearch}
                onSubmitEditing={handleSubmit}
                placeholderTextColor={tokens.color.textMuted}
                returnKeyType="search"
                accessibilityLabel={isCustomization ? "Feltét keresőmező" : "Étel keresőmező"}
                accessibilityHint="Írd be a keresett kifejezést, majd indítsd a keresést."
            />
            <TouchableOpacity
                className="icon-btn"
                onPress={() => router.setParams({ query })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Keresés indítása"
                accessibilityHint="Frissíti a listát a megadott kereséssel."
            >
                <Image
                    source={images.search}
                    className="size-5"
                    resizeMode="contain"
                    tintColor={tokens.color.textSecondary}
                />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;
