import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import { signOut } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { TabBarIconProps } from "@/type";
import cn from "clsx";
import { Redirect, router, Tabs } from "expo-router";
import { Alert, Image, Keyboard, Text, useWindowDimensions, View } from "react-native";

const AdminTabIcon = ({ focused, icon, title }: TabBarIconProps) => (
    <View className="tab-icon">
        <Image
            source={icon}
            className="size-7"
            resizeMode="contain"
            tintColor={focused ? tokens.color.brandPrimary : tokens.color.textSecondary}
        />
        <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={cn("text-sm font-quicksand-semibold", focused ? "text-brand-primary" : "text-text-secondary")}
        >
            {title}
        </Text>
    </View>
);

export default function AdminTabLayout() {
    const { isAuthenticated, isAdmin, setUser, setIsAuthenticated, setIsAdmin } = useAuthStore();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    if (!isAuthenticated) return <Redirect href="/sign-in" />;
    if (!isAdmin) return <Redirect href="/" />;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    borderWidth: 2,
                    borderColor: tokens.color.borderStrong,
                    height: 80,
                    position: 'absolute',
                    bottom: 0,
                    backgroundColor: tokens.color.surfaceCard,
                    elevation: 5
                },
                tabBarItemStyle: {
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: isTablet ? 8 : 20,
                    paddingBottom: 0,
                },
            }}
        >
            <Tabs.Screen
                name="add"
                options={{
                    title: "Hozzáadás",
                    tabBarIcon: ({ focused }) => (
                        <AdminTabIcon title="Hozzáadás" icon={images.plus} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="edit"
                options={{
                    title: "Szerkesztés",
                    tabBarIcon: ({ focused }) => (
                        <AdminTabIcon title="Szerkesztés" icon={images.pencil} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="logout"
                options={{
                    title: "Kilépés",
                    tabBarIcon: ({ focused }) => (
                        <AdminTabIcon title="Kilépés" icon={images.logout} focused={focused} />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        Alert.alert(
                            "Kijelentkezés",
                            "Biztosan ki szeretnél lépni?",
                            [
                                { text: "Mégse", style: "cancel" },
                                {
                                    text: "Kilépés",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            Keyboard.dismiss();
                                            await signOut();
                                            setUser(null);
                                            setIsAuthenticated(false);
                                            setIsAdmin(false);
                                            router.replace("/sign-in");
                                        } catch (error: any) {
                                            Alert.alert("Hiba", error?.message ?? "Nem sikerült kijelentkezni.");
                                        }
                                    },
                                },
                            ]
                        );
                    },
                }}
            />
            <Tabs.Screen name="add-product" options={{ href: null }} />
            <Tabs.Screen name="add-customization" options={{ href: null }} />
            <Tabs.Screen name="edit-product" options={{ href: null }} />
            <Tabs.Screen name="edit-product-item/[id]" options={{ href: null }} />
            <Tabs.Screen name="edit-customization" options={{ href: null }} />
            <Tabs.Screen name="edit-customization-item/[id]" options={{ href: null }} />
        </Tabs>
    );
}
