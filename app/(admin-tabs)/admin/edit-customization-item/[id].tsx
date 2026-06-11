import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import BottomSheetModal from "@/components/BottomSheetModal";
import CustomHeader from "@/components/CustomHeader";
import FormActions from "@/components/FormActions";
import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import {
  deleteCustomization,
  getCustomizationById,
  updateCustomization,
} from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import useNavigationStore from "@/store/navigation.store";
import { Customization } from "@/type";
import cn from "clsx";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type SortableCustomizationType = "size" | "topping" | "side";

const TYPE_OPTIONS: { key: SortableCustomizationType; label: string }[] = [
  { key: "size", label: "Méret" },
  { key: "topping", label: "Feltét" },
  { key: "side", label: "Szósz" },
];

export default function AdminEditCustomizationItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const safeId = typeof id === "string" ? id : "";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<SortableCustomizationType>("topping");
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const consumeBackTarget = useNavigationStore((state) => state.consumeBackTarget);
  const { registerScrollRef } = useKeyboardAwareScroll();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { data: customization, loading, refetch } = useAppwrite<
    Customization,
    { id: string }
  >({
    fn: getCustomizationById as unknown as (params: { id: string }) => Promise<Customization>,
    params: { id: safeId },
    skip: !safeId,
  });

  useEffect(() => {
    if (!safeId) return;
    refetch({ id: safeId });
  }, [safeId, refetch]);

  useEffect(() => {
    if (!customization || !customization.$id || hydratedId === customization.$id) return;

    setName(customization.name ?? "");
    setPrice(customization.price ? String(customization.price) : "");
    setType(customization.type);
    setHydratedId(customization.$id);
  }, [customization, hydratedId]);

  const goBackToCustomizationList = () => {
    const currentPath = safeId
      ? `/admin/edit-customization-item/${safeId}`
      : "/admin/edit-customization-item";
    const targetPath = consumeBackTarget(currentPath, "/admin/edit-customization");
    router.replace(targetPath as never);
  };

  const handleSave = async () => {
    if (!safeId) {
      Alert.alert("Hiba", "Hiányzik a feltét azonosítója.");
      return;
    }

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
      await updateCustomization({
        id: safeId,
        name: trimmedName,
        price: parsedPrice,
        type,
      });
      Alert.alert("Siker", "A feltét adatainak mentése sikeres volt.");
      goBackToCustomizationList();
    } catch (error: any) {
      Alert.alert("Mentési hiba", error?.message ?? "Nem sikerült menteni a feltétet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!safeId) return;

    Alert.alert("Feltét törlése", "Biztosan törlöd ezt a feltétet?", [
      { text: "Mégse", style: "cancel" },
      {
        text: "Törlés",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteCustomization({ id: safeId });
            Alert.alert("Siker", "A feltét sikeresen törölve lett.");
            goBackToCustomizationList();
          } catch (error: any) {
            Alert.alert("Törlési hiba", error?.message ?? "Nem sikerült törölni a feltétet.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (!safeId) {
    return (
      <SafeAreaView className="screen">
        <View className="flex-1 px-5 pt-5">
          <CustomHeader title="Feltét szerkesztése" onBackPress={goBackToCustomizationList} />
          <View className="mt-6 surface-card p-5">
            <Text className="body-large">Hiányzik a feltét azonosítója.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const activeTypeLabel =
    TYPE_OPTIONS.find((option) => option.key === type)?.label ?? "Feltét";

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
          <CustomHeader title="Feltét szerkesztése" onBackPress={goBackToCustomizationList} />

          {loading ? (
            <View className="mt-10 items-center">
              <ActivityIndicator size="small" color={tokens.color.brandPrimary} />
              <Text className="body-regular mt-3">Feltét betöltése...</Text>
            </View>
          ) : (
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
                <TouchableOpacity
                  className="input flex-between flex-row border-border-strong"
                  onPress={() => setIsTypeModalVisible(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="base-semibold">{activeTypeLabel}</Text>
                  <Text className="base-bold">▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="mt-8">
            <FormActions
              onSave={handleSave}
              isSaving={isSaving}
              onCancel={goBackToCustomizationList}
              disableCancel={isSaving || isDeleting}
              destructiveTitle="Feltét törlése"
              onDestructive={handleDelete}
              isDestructiveLoading={isDeleting}
              disableDestructive={isSaving || isDeleting}
            />
          </View>
          <Image
            source={images.ingredients}
            resizeMode="contain"
            className="self-center"
            style={{
              width: isTablet ? 600 : 240,
              height: isTablet ? 300 : 120,
              marginTop: isTablet ? 120 : 60,
              marginBottom: isTablet ? 8 : 0,
            }}
          />

        </AppKeyboardAwareScrollView>
      </View>

      <BottomSheetModal
        visible={isTypeModalVisible}
        onClose={() => setIsTypeModalVisible(false)}
        title="Típus választása"
      >
        <View>
          {TYPE_OPTIONS.map((option, index) => {
            const selected = type === option.key;
            return (
              <Pressable
                key={option.key}
                className={cn(
                  "flex-row items-center justify-between py-4",
                  index !== TYPE_OPTIONS.length - 1 ? "border-b border-border-subtle" : ""
                )}
                onPress={() => {
                  setType(option.key);
                  setIsTypeModalVisible(false);
                }}
              >
                <Text className="base-semibold">{option.label}</Text>
                {selected ? (
                  <Text className="paragraph-semibold text-brand-primary">Kiválasztva</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
