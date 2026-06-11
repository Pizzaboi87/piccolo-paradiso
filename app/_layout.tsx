import { appwriteConfig } from "@/lib/appwrite";
import FeedbackHost from "@/components/FeedbackHost";
import { installCustomAlert } from "@/lib/feedback";
import useAuthStore from "@/store/auth.store";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { AppState, LogBox, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release.",
]);

export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Light": require("../assets/fonts/Quicksand-Light.ttf")
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser])

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const enforceHiddenAndroidNavbar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch {
        // Ignore unsupported devices or OS-specific failures.
      }
    };

    enforceHiddenAndroidNavbar();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        enforceHiddenAndroidNavbar();
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  useEffect(() => {
    const uninstall = installCustomAlert();
    return () => uninstall();
  }, []);

  if (!fontsLoaded || isLoading) return null;

  return (
    <StripeProvider
      publishableKey={appwriteConfig.stripePublishableKey || ""}
      urlScheme="foodorder"
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <FeedbackHost />
      </SafeAreaProvider>
    </StripeProvider>
  );
}
