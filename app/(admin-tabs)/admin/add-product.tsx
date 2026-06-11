import BottomSheetModal from "@/components/BottomSheetModal";
import CustomHeader from "@/components/CustomHeader";
import FormActions from "@/components/FormActions";
import { tokens } from "@/constants/tokens";
import { createMenuItem, getCategories } from "@/lib/appwrite";
import { uploadImageToCloudinarySigned } from "@/lib/cloudinary";
import useAppwrite from "@/lib/useAppwrite";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import { Category } from "@/type";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminAddProductScreen() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { registerScrollRef, scrollToBottomOnFocus } =
    useKeyboardAwareScroll();
  const insets = useSafeAreaInsets();

  const fetchCategories = async () => (await getCategories()) as unknown as Category[];
  const { data: categories, loading: categoriesLoading } = useAppwrite<Category[], Record<string, never>>({
    fn: fetchCategories as any,
    params: {},
  });

  const selectedCategoryName = useMemo(() => {
    if (!categoryId || !categories) return "";
    return categories.find((c) => c.$id === categoryId)?.name ?? "";
  }, [categoryId, categories]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setCategoryId("");
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();
    const parsedPrice = Number(price);

    if (!trimmedName || !trimmedDescription || !trimmedImageUrl || !categoryId || !price.trim()) {
      Alert.alert("Hiányzó adatok", "Tölts ki minden kötelező mezőt.");
      return;
    }

    if (!Number.isInteger(parsedPrice) || parsedPrice < 1 || parsedPrice > 10000) {
      Alert.alert("Hibás ár", "Az ár 1 és 10000 Ft közötti egész szám lehet.");
      return;
    }

    const looksLikeUrl = /^https?:\/\/.+/i.test(trimmedImageUrl);
    if (!looksLikeUrl) {
      Alert.alert("Hibás URL", "Adj meg érvényes kép URL-t (https://...).");
      return;
    }

    setIsSaving(true);
    try {
      await createMenuItem({
        name: trimmedName,
        description: trimmedDescription,
        imageUrl: trimmedImageUrl,
        price: parsedPrice,
        categoryId,
      });

      Alert.alert("Siker", "A termék hozzáadása sikeres volt.");
      resetForm();
      router.back();
    } catch (error: any) {
      Alert.alert("Mentési hiba", error?.message ?? "Nem sikerült létrehozni a terméket.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickAndUploadImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Engedély szükséges", "A galéria használatához engedélyezd a fotók elérését.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinarySigned({
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || `item-${Date.now()}.jpg`,
        folder: "items",
      });

      setImageUrl(uploadedUrl);
      Alert.alert("Siker", "A képfeltöltés sikeres volt.");
    } catch (error: any) {
      Alert.alert("Feltöltési hiba", error?.message ?? "Nem sikerült a kép feltöltése.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <SafeAreaView className="screen">
      <View className="flex-1">
        <AppKeyboardAwareScrollView
          ref={registerScrollRef}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 180 + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          extraKeyboardSpace={24}
          bottomOffset={12}
        >
          <CustomHeader title="Termék hozzáadása" onBackPress={() => router.back()} />

          <View className="mt-3 gap-4">
            <View>
              <Text className="label">Név</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                className="input border-border-strong"
                placeholder="Pl. Sonkás pizza"
                placeholderTextColor={tokens.color.textMuted}
              />
            </View>

            <View>
              <Text className="label">Leírás</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="min-h-28 rounded-xl border border-border-strong bg-surface-card px-4 py-3 text-base font-quicksand-semibold text-text-primary"
                placeholder="Rövid leírás..."
                placeholderTextColor={tokens.color.textMuted}
                multiline
                textAlignVertical="top"
                onFocus={scrollToBottomOnFocus}
              />
            </View>

            <View>
              <Text className="label">Kép URL</Text>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                className="input border-border-strong"
                placeholder="https://res.cloudinary.com/..."
                placeholderTextColor={tokens.color.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={scrollToBottomOnFocus}
              />
              <View className="mt-3">
                <Pressable
                  className="h-12 items-center justify-center rounded-2xl border border-border-strong bg-surface-muted"
                  onPress={handlePickAndUploadImage}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color={tokens.color.brandPrimary} />
                  ) : (
                    <Text className="paragraph-semibold text-text-primary">Kép kiválasztása és feltöltése</Text>
                  )}
                </Pressable>
              </View>

              {Boolean(imageUrl.trim()) && (
                <View className="mt-3 overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
                  <Image source={{ uri: imageUrl.trim() }} className="h-44 w-full" resizeMode="cover" />
                </View>
              )}
            </View>

            <View>
              <Text className="label">Ár (Ft)</Text>
              <TextInput
                value={price}
                onChangeText={(text) => setPrice(text.replace(/[^\d]/g, ""))}
                className="input border-border-strong"
                placeholder="Pl. 2490"
                placeholderTextColor={tokens.color.textMuted}
                keyboardType="numeric"
                onFocus={scrollToBottomOnFocus}
              />
            </View>

            <View>
              <Text className="label">Kategória</Text>
              <TouchableOpacity
                className="input flex-between flex-row border-border-strong"
                onPress={() => setIsCategoryModalVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className={selectedCategoryName ? "base-semibold" : "base-semibold text-text-muted"}>
                  {selectedCategoryName || "Válassz kategóriát"}
                </Text>
                <Text className="base-bold">▼</Text>
              </TouchableOpacity>
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
        </AppKeyboardAwareScrollView>
      </View>

      <BottomSheetModal
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        title="Kategória kiválasztása"
      >
        {categoriesLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color={tokens.color.brandPrimary} />
            <Text className="body-regular mt-2">Kategóriák betöltése...</Text>
          </View>
        ) : (
          <FlatList
            data={categories ?? []}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => {
              const selected = categoryId === item.$id;
              return (
                <Pressable
                  className="flex-row items-center justify-between border-b border-border-subtle py-4"
                  onPress={() => {
                    setCategoryId(item.$id);
                    setIsCategoryModalVisible(false);
                  }}
                >
                  <Text className="base-semibold">{item.name}</Text>
                  {selected ? <Text className="paragraph-semibold text-brand-primary">Kiválasztva</Text> : null}
                </Pressable>
              );
            }}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
