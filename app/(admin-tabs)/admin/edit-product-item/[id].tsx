import BottomSheetModal from "@/components/BottomSheetModal";
import CustomHeader from "@/components/CustomHeader";
import FormActions from "@/components/FormActions";
import { tokens } from "@/constants/tokens";
import {
  deleteMenuItem,
  getCategories,
  getItemById,
  updateMenuItem,
} from "@/lib/appwrite";
import { uploadImageToCloudinarySigned } from "@/lib/cloudinary";
import useAppwrite from "@/lib/useAppwrite";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import useNavigationStore from "@/store/navigation.store";
import { Category, MenuItem } from "@/type";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

export default function AdminEditProductItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);
  const consumeBackTarget = useNavigationStore((state) => state.consumeBackTarget);

  const { registerScrollRef, scrollToBottomOnFocus } =
    useKeyboardAwareScroll();
  const insets = useSafeAreaInsets();

  const safeId = typeof id === "string" ? id : "";

  const { data: item, loading: itemLoading, refetch: refetchItem } = useAppwrite<MenuItem, { id: string }>({
    fn: getItemById as unknown as (params: { id: string }) => Promise<MenuItem>,
    params: { id: safeId },
    skip: !safeId,
  });

  const fetchCategories = async () => (await getCategories()) as unknown as Category[];
  const { data: categories, loading: categoriesLoading } = useAppwrite<
    Category[],
    Record<string, never>
  >({
    fn: fetchCategories as any,
    params: {},
  });

  useEffect(() => {
    if (!safeId) return;
    refetchItem({ id: safeId });
  }, [safeId, refetchItem]);

  useEffect(() => {
    if (!item || !item.$id || hydratedItemId === item.$id) return;

    setName(item.name ?? "");
    setDescription(item.description ?? "");
    setImageUrl(item.image_url ?? "");
    setPrice(item.price ? String(item.price) : "");
    setCategoryId(typeof item.category === "string" ? item.category : item.category?.$id ?? "");
    setHydratedItemId(item.$id);
  }, [item, hydratedItemId]);

  const selectedCategoryName = useMemo(() => {
    if (!categoryId || !categories) return "";
    return categories.find((c) => c.$id === categoryId)?.name ?? "";
  }, [categoryId, categories]);

  const goBackToProductList = () => {
    const currentPath = safeId ? `/admin/edit-product-item/${safeId}` : "/admin/edit-product-item";
    const targetPath = consumeBackTarget(currentPath, "/admin/edit-product");
    router.replace(targetPath as never);
  };

  const handleSave = async () => {
    if (!safeId) {
      Alert.alert("Hiba", "Hiányzik a termék azonosítója.");
      return;
    }

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
      await updateMenuItem({
        id: safeId,
        name: trimmedName,
        description: trimmedDescription,
        imageUrl: trimmedImageUrl,
        price: parsedPrice,
        categoryId,
      });

      Alert.alert("Siker", "A termék adatainak mentése sikeres volt.");
      goBackToProductList();
    } catch (error: any) {
      Alert.alert("Mentési hiba", error?.message ?? "Nem sikerült menteni a terméket.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!safeId) return;

    Alert.alert(
      "Termék törlése",
      "Biztosan törlöd ezt a terméket?",
      [
        { text: "Mégse", style: "cancel" },
        {
          text: "Törlés",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteMenuItem({ id: safeId });
              Alert.alert("Siker", "A termék törölve.");
              goBackToProductList();
            } catch (error: any) {
              Alert.alert("Törlési hiba", error?.message ?? "Nem sikerült törölni a terméket.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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

  if (!safeId) {
    return (
      <SafeAreaView className="screen">
        <View className="flex-1 px-5 pt-5">
          <CustomHeader title="Termék szerkesztése" onBackPress={goBackToProductList} />
          <View className="mt-6 surface-card p-5">
            <Text className="body-large">Hiányzik a termék azonosítója.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <CustomHeader title="Termék szerkesztése" onBackPress={goBackToProductList} />

          {itemLoading ? (
            <View className="mt-10 items-center">
              <ActivityIndicator size="small" color={tokens.color.brandPrimary} />
              <Text className="body-regular mt-3">Termék betöltése...</Text>
            </View>
          ) : (
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
                      <Text className="paragraph-semibold text-text-primary">
                        Kép kiválasztása és feltöltése
                      </Text>
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
          )}

          <View className="mt-8">
            <FormActions
              onSave={handleSave}
              isSaving={isSaving}
              onCancel={goBackToProductList}
              disableCancel={isSaving || isDeleting}
              destructiveTitle="Termék törlése"
              onDestructive={handleDelete}
              isDestructiveLoading={isDeleting}
              disableDestructive={isSaving || isDeleting}
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
          <View className="items-center py-8">
            <ActivityIndicator size="small" color={tokens.color.brandPrimary} />
            <Text className="body-regular mt-2">Kategóriák betöltése...</Text>
          </View>
        ) : (
          <FlatList
            data={categories ?? []}
            keyExtractor={(categoryItem) => categoryItem.$id}
            renderItem={({ item: categoryItem }) => {
              const selected = categoryId === categoryItem.$id;
              return (
                <Pressable
                  className="flex-row items-center justify-between border-b border-border-subtle py-4"
                  onPress={() => {
                    setCategoryId(categoryItem.$id);
                    setIsCategoryModalVisible(false);
                  }}
                >
                  <Text className="base-semibold">{categoryItem.name}</Text>
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
