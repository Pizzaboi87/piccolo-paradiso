import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import CustomHeader from "@/components/CustomHeader";
import FormActions from "@/components/FormActions";
import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { createCustomization } from "@/lib/appwrite";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import { Customization } from "@/type";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminCustomizationType = Exclude<Customization["type"], "size">;

const CUSTOMIZATION_TYPES: AdminCustomizationType[] = ["topping", "side"];

const TYPE_LABELS: Record<AdminCustomizationType, string> = {
    topping: "Feltét",
    side: "Szósz",
};

export default function AdminAddCustomizationScreen() {
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [type, setType] = useState<AdminCustomizationType>("topping");

    const { registerScrollRef } = useKeyboardAwareScroll();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const resetForm = () => {
        setName("");
        setPrice("");
        setType("topping");
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const parsedPrice = Number(price);

        if (!trimmedName || !price.trim()) {
            Alert.alert("Hiányzó adatok", "Tölts ki minden kötelező mezőt.");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 10000) {
            Alert.alert("Hibás ár", "Az ár 0 és 10000 Ft közötti szám lehet.");
            return;
        }

        setIsSaving(true);
        try {
            await createCustomization({
                name: trimmedName,
                price: parsedPrice,
                type,
            });

            Alert.alert("Siker", "A feltét hozzáadása sikeres volt.");
            resetForm();
            router.back();
        } catch (error: any) {
            Alert.alert("Mentési hiba", error?.message ?? "Nem sikerült létrehozni a feltétet.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="screen">
            <View className="flex-1">
                <AppKeyboardAwareScrollView
                    ref={registerScrollRef}
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    extraKeyboardSpace={24}
                    bottomOffset={12}
                >
                    <CustomHeader title="Feltét hozzáadása" onBackPress={() => router.back()} />

                    <View className="mt-3 gap-4">
                        <View>
                            <Text className="label">Név</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="input border-border-strong"
                                placeholder="Pl. Extra sajt"
                                placeholderTextColor={tokens.color.textMuted}
                            />
                        </View>

                        <View>
                            <Text className="label">Ár (Ft)</Text>
                            <TextInput
                                value={price}
                                onChangeText={(text) => setPrice(text.replace(/[^\d.]/g, ""))}
                                className="input border-border-strong"
                                placeholder="Pl. 390"
                                placeholderTextColor={tokens.color.textMuted}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View>
                            <Text className="label">Típus</Text>
                            <View className="flex-row gap-2">
                                {CUSTOMIZATION_TYPES.map((option) => {
                                    const selected = type === option;
                                    return (
                                        <Pressable
                                            key={option}
                                            className={`h-12 flex-1 items-center justify-center rounded-2xl border ${selected
                                                ? "border-brand-primary bg-brand-primary"
                                                : "border-border-strong bg-surface-card"
                                                }`}
                                            onPress={() => setType(option)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Text
                                                className={`paragraph-semibold ${selected ? "text-text-inverse" : "text-text-primary"
                                                    }`}
                                            >
                                                {TYPE_LABELS[option]}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <View className="mt-8">
                        <FormActions
                            onSave={handleSave}
                            isSaving={isSaving}
                            onCancel={() => router.back()}
                            disableCancel={isSaving}
                        />
                    </View>

                    <Image
                        source={images.sauces}
                        resizeMode="contain"
                        className="mx-auto"
                        style={{
                            width: isTablet ? 400 : 220,
                            height: isTablet ? 200 : 96,
                            marginTop: isTablet ? 120 : 60,
                            marginBottom: isTablet ? 8 : 0,
                        }}
                    />
                </AppKeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    );
}
