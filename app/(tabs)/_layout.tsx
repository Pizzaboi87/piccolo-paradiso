import { images } from "@/constants";
import { tokens } from "@/constants/tokens";
import useAuthStore from "@/store/auth.store";
import useNavigationStore from "@/store/navigation.store";
import { TabBarIconProps } from "@/type";
import cn from "clsx";
import { Redirect, router, Tabs, usePathname } from "expo-router";
import { Image, Text, useWindowDimensions, View } from "react-native";

const TabBarIcon = ({ focused, icon, title }: TabBarIconProps) => (
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
)

export default function TabLayout() {
    const { isAuthenticated, isAdmin } = useAuthStore();
    const pathname = usePathname();
    const pushSource = useNavigationStore((state) => state.pushSource);
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    if (!isAuthenticated) return <Redirect href="/sign-in" />
    if (isAdmin) return <Redirect href="/admin/add" />

    return (
        <Tabs screenOptions={{
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
        }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Főoldal',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Főoldal" icon={images.home} focused={focused} />
                }}
            />
            <Tabs.Screen
                name='search'
                options={{
                    title: 'Keresés',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Keresés" icon={images.search} focused={focused} />
                }}
            />
            <Tabs.Screen
                name='cart'
                options={{
                    title: 'Kosár',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Kosár" icon={images.bag} focused={focused} />
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();

                        if (pathname === "/cart") return;

                        pushSource(pathname);
                        router.push("/cart");
                    },
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Profil" icon={images.user} focused={focused} />
                }}
            />
        </Tabs>
    );
}
