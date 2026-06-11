import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { router } from "expo-router";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminAddScreen() {
    return (
        <SafeAreaView className="screen">
            <View className="flex-1 px-5 pt-5 pb-28">
                <Text className="h3-bold">Hozzáadás</Text>
                <Text className="mt-1 body-large">Válaszd ki, mit szeretnél létrehozni.</Text>

                <View className="mt-4 flex-1 gap-4">
                    <Pressable
                        className="flex-1 overflow-hidden rounded-3xl"
                        onPress={() => router.push("/admin/add-product")}
                    >
                        <ImageBackground source={images.productsAdd} className="flex-1" resizeMode="cover">
                            <View className="flex-1 justify-end">
                                <View className="w-full flex flex-row justify-between items-center px-5 py-4" style={{ backgroundColor: "rgba(18,18,20,0.66)" }}>
                                    <View>
                                        <Text className="text-3xl font-quicksand-bold text-text-inverse">Termékek</Text>
                                        <Text className="mt-1 body-large text-text-inverse">Új termék hozzáadása</Text>
                                    </View>

                                    <Image
                                        source={images.plus}
                                        className="h-8 w-8"
                                        resizeMode="contain"
                                        tintColor={tokens.color.textInverse}
                                    />
                                </View>
                            </View>
                        </ImageBackground>
                    </Pressable>

                    <Pressable
                        className="flex-1 overflow-hidden rounded-3xl"
                        onPress={() => router.push("/admin/add-customization")}
                    >
                        <ImageBackground source={images.ingredientsAdd} className="flex-1" resizeMode="cover">
                            <View className="flex-1 justify-end">
                                <View className="w-full flex flex-row justify-between items-center px-5 py-4" style={{ backgroundColor: "rgba(18,18,20,0.66)" }}>
                                    <View>
                                        <Text className="text-3xl font-quicksand-bold text-text-inverse">Feltétek</Text>
                                        <Text className="mt-1 body-large text-text-inverse">Új feltét hozzáadása</Text>
                                    </View>

                                    <Image
                                        source={images.plus}
                                        className="h-8 w-8"
                                        resizeMode="contain"
                                        tintColor={tokens.color.textInverse}
                                    />
                                </View>
                            </View>
                        </ImageBackground>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
