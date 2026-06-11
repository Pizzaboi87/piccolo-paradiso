import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import BottomSheetModal from "@/components/BottomSheetModal";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { streets } from "@/constants/streets";
import { tokens } from "@/constants/tokens";
import { signOut, updateCurrentUserAvatar, updateCurrentUserProfile } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_CITY = "Kisvárda";

const allowedPrefixes = ["20", "30", "31", "50", "70"];

const normalizeHuPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let normalized = "";

    if (digits.startsWith("0036")) normalized = `36${digits.slice(4)}`;
    else if (digits.startsWith("06")) normalized = `36${digits.slice(1)}`;
    else if (digits.startsWith("36")) normalized = digits;
    else if (digits.length === 9 && allowedPrefixes.some((prefix) => digits.startsWith(prefix))) {
        normalized = `36${digits}`;
    }

    if (!/^36\d{9}$/.test(normalized)) return null;

    const prefix = normalized.slice(2, 4);
    if (!allowedPrefixes.includes(prefix)) return null;

    return `+${normalized}`;
};

const Profile = () => {
    const { user, setUser, setIsAuthenticated, setIsAdmin } = useAuthStore();

    const [isSaving, setIsSaving] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isStreetModalVisible, setIsStreetModalVisible] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [city] = useState(user?.city?.trim() || DEFAULT_CITY);
    const [street, setStreet] = useState(user?.street ?? "");
    const [houseNumber, setHouseNumber] = useState(user?.houseNumber ?? "");
    const [floorDoor, setFloorDoor] = useState(user?.floorDoor ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");

    useEffect(() => {
        if (!user) return;

        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setStreet(user.street ?? "");
        setHouseNumber(user.houseNumber ?? "");
        setFloorDoor(user.floorDoor ?? "");
        setPhone(user.phone ?? "");
    }, [user]);

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [user?.avatar]);

    const displayedFullName = `${lastName} ${firstName}`.trim() || "Név nélküli felhasználó";

    const uploadAvatarAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        const extension = asset.fileName?.split(".").pop() || "jpg";
        const mimeType = asset.mimeType || "image/jpeg";
        const fileName = asset.fileName || `avatar-${Date.now()}.${extension}`;

        setIsAvatarUploading(true);
        try {
            const updated = await updateCurrentUserAvatar({
                uri: asset.uri,
                name: fileName,
                type: mimeType,
                size: asset.fileSize || 1024,
            });

            setUser(updated as any);
            Alert.alert("Siker", "A profilképed frissítve lett.");
        } catch (error: any) {
            Alert.alert("Hiba", error?.message ?? "Nem sikerült feltölteni a profilképet.");
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const chooseAvatarFromLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== "granted") {
            Alert.alert("Engedély szükséges", "A galéria használatához engedélyezd a fotók elérését.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadAvatarAsset(result.assets[0]);
        }
    };

    const takeAvatarPhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
            Alert.alert("Engedély szükséges", "A kamera használatához engedélyezd a kamera elérését.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
            cameraType: ImagePicker.CameraType.front,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadAvatarAsset(result.assets[0]);
        }
    };

    const handleAvatarPress = () => {
        if (isAvatarUploading) return;

        Alert.alert("Profilkép", "Honnan szeretnéd beállítani a profilképet?", [
            { text: "Mégse", style: "cancel" },
            { text: "Galériából", onPress: chooseAvatarFromLibrary },
            { text: "Új fotó", onPress: takeAvatarPhoto },
        ]);
    };

    const handleSave = async () => {
        if (!lastName.trim() || !firstName.trim()) {
            Alert.alert("Hiba", "A vezetéknév és a keresztnév kitöltése kötelező.");
            return;
        }

        if (!street.trim()) {
            Alert.alert("Hiba", "Válassz utcát.");
            return;
        }

        if (!houseNumber.trim()) {
            Alert.alert("Hiba", "Add meg a házszámot.");
            return;
        }

        const normalizedPhone = normalizeHuPhone(phone);
        if (!normalizedPhone) {
            Alert.alert("Hiba", "Adj meg érvényes magyar telefonszámot.");
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateCurrentUserProfile({
                firstName,
                lastName,
                city,
                street,
                houseNumber,
                floorDoor,
                phone: normalizedPhone,
            });

            setUser(updated as any);
            setPhone(normalizedPhone);
            Alert.alert("Siker", "Profil mentve.");
        } catch (error: any) {
            Alert.alert(
                "Mentési hiba",
                error?.message ?? "Nem sikerült menteni a profilt. Probléma az Apprwrite beállításokkal."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const performSignOut = async () => {
        setIsSigningOut(true);
        try {
            Keyboard.dismiss();
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            router.replace("/sign-in");
        } catch (error: any) {
            Alert.alert("Hiba", error?.message ?? "Nem sikerült kijelentkezni.");
        } finally {
            setIsSigningOut(false);
        }
    };

    const handleSignOut = () => {
        if (isSigningOut) return;

        Alert.alert(
            "Kijelentkezés",
            "Biztosan ki szeretnél jelentkezni?",
            [
                { text: "Mégse", style: "cancel" },
                {
                    text: "Kijelentkezés",
                    style: "destructive",
                    onPress: () => {
                        void performSignOut();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="screen">
            <AppKeyboardAwareScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                className="md:w-3/4 mx-auto flex-1"
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 160,
                }}
                extraKeyboardSpace={40}
                bottomOffset={12}
            >
                <View className="mt-6 items-center p-2">
                    <TouchableOpacity
                        onPress={handleAvatarPress}
                        disabled={isAvatarUploading}
                        className="relative"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Image
                            source={user?.avatar && !avatarLoadFailed ? { uri: user.avatar } : images.avatar}
                            className="size-32 rounded-full"
                            resizeMode="cover"
                            onError={() => setAvatarLoadFailed(true)}
                        />
                        {isAvatarUploading && (
                            <View className="absolute inset-0 items-center justify-center rounded-full" style={{ backgroundColor: tokens.color.overlay }}>
                                <ActivityIndicator size="small" color={tokens.color.textInverse} />
                            </View>
                        )}
                        <View className="absolute -bottom-1 -right-1 size-8 items-center justify-center rounded-full bg-surface-card">
                            <Image source={images.edit} className="size-4" resizeMode="contain" />
                        </View>
                    </TouchableOpacity>
                    <Text className="mt-3 base-bold">{displayedFullName}</Text>
                    <Text className="body-regular">{user?.email}</Text>
                </View>

                <View className="mt-6 gap-4">
                    <View>
                        <Text className="label">Vezetéknév</Text>
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            className="input border-border-strong"
                            placeholder="Pl. Kiss"
                            placeholderTextColor={tokens.color.textMuted}
                            autoCapitalize="words"
                        />
                    </View>

                    <View>
                        <Text className="label">Keresztnév</Text>
                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            className="input border-border-strong"
                            placeholder="Pl. Anna"
                            placeholderTextColor={tokens.color.textMuted}
                            autoCapitalize="words"
                        />
                    </View>

                    <View>
                        <Text className="label">Város</Text>
                        <View className="input justify-center border-border-strong bg-surface-muted">
                            <Text className="base-semibold">{city}</Text>
                        </View>
                    </View>

                    <View>
                        <Text className="label">Utca</Text>
                        <TouchableOpacity
                            className="input flex-between flex-row border-border-strong"
                            onPress={() => setIsStreetModalVisible(true)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text className={street ? "base-semibold" : "base-semibold text-text-muted"}>
                                {street || "Válassz utcát"}
                            </Text>
                            <Text className="base-bold">▼</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="label">Házszám</Text>
                        <TextInput
                            value={houseNumber}
                            onChangeText={setHouseNumber}
                            className="input border-border-strong"
                            placeholder="Pl. 12/B"
                            placeholderTextColor={tokens.color.textMuted}
                        />
                    </View>

                    <View>
                        <Text className="label">Emelet / Ajtó</Text>
                        <TextInput
                            value={floorDoor}
                            onChangeText={setFloorDoor}
                            className="input border-border-strong"
                            placeholder="Pl. 2/5 (opcionális)"
                            placeholderTextColor={tokens.color.textMuted}
                        />
                    </View>

                    <View>
                        <Text className="label">Telefonszám</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            className="input border-border-strong"
                            placeholder="Pl. +36 30 123 4567"
                            placeholderTextColor={tokens.color.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View className="mt-8 gap-3 pb-12">
                    <CustomButton title="Profil mentése" isLoading={isSaving} onPress={handleSave} />
                    <CustomButton
                        title="Korábbi rendeléseim"
                        onPress={() => router.push("/orders")}
                        style="bg-brand-primary/10 border border-brand-primary/30"
                        textStyle="text-brand-primary"
                    />
                    <CustomButton
                        title="Kijelentkezés"
                        isLoading={isSigningOut}
                        onPress={handleSignOut}
                        style="bg-surface-card border border-border-strong"
                        textStyle="text-text-primary"
                        loadingColor={tokens.color.textPrimary}
                    />
                </View>
            </AppKeyboardAwareScrollView>

            <BottomSheetModal
                visible={isStreetModalVisible}
                onClose={() => setIsStreetModalVisible(false)}
                title="Utcaválasztás"
            >
                <FlatList
                    data={streets}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-between flex-row border-b border-border-subtle py-4"
                            onPress={() => {
                                setStreet(item);
                                setIsStreetModalVisible(false);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text className="paragraph-medium">{item}</Text>
                            {item === street ? <Text className="paragraph-bold text-brand-primary">Kiválasztva</Text> : null}
                        </TouchableOpacity>
                    )}
                />
            </BottomSheetModal>
        </SafeAreaView>
    );
};

export default Profile;
