import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import useAuthStore from "@/store/auth.store";
import useKeyboardAwareScroll from "@/lib/useKeyboardAwareScroll";
import AppKeyboardAwareScrollView from "@/components/AppKeyboardAwareScrollView";
import { Redirect, Slot } from "expo-router";
import { Dimensions, Image, ImageBackground, View } from "react-native";

export default function AuthLayout() {
    const { isAuthenticated } = useAuthStore();
    const { registerScrollRef } = useKeyboardAwareScroll();
    const screenHeight = Dimensions.get("screen").height;
    const heroHeight = Math.round(screenHeight / 2.5);

    if (isAuthenticated) return <Redirect href="/" />

    return (
        <AppKeyboardAwareScrollView
            ref={registerScrollRef}
            className="screen"
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: 24 }}
            extraKeyboardSpace={140}
            bottomOffset={24}
        >
            <View
                className="w-full relative"
                style={{ height: heroHeight }}
            >
                <View pointerEvents="none" className="size-full absolute -top-14">
                    <ImageBackground
                        source={images.loginGraphic}
                        className="size-full"
                        resizeMode="stretch"
                    />
                </View>
                <View
                    className="self-center absolute bottom-2 z-10 bg-surface-card rounded-3xl p-2.5"
                    pointerEvents="none"
                    style={{
                        shadowColor: tokens.color.textPrimary,
                        shadowOpacity: 0.18,
                        shadowRadius: 14,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 8,
                    }}
                >
                    <Image source={images.logo} className="size-44" />
                </View>
            </View>
            <View className="pt-3">
                <Slot />
            </View>
        </AppKeyboardAwareScrollView>
    )
}
