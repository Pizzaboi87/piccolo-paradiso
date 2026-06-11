import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { signIn } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from 'react-native';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();

    const submit = async () => {
        const { email, password } = form;

        if (!email || !password) {
            return Alert.alert('Hiba', 'Adj meg érvenyes email címet és jelszót.');
        }

        setIsSubmitting(true);

        try {
            await signIn({ email, password });
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch (error: any) {
            const message = error?.message ?? '';

            if (message.includes('Invalid credentials')) {
                Alert.alert('Hiba', 'Hibás email címet vagy jelszót adtál meg.');
            } else if (message.includes('Value must be a valid email address')) {
                Alert.alert('Hiba', 'A megadott email cím formátuma helytelen.')
            } else if (message.includes('Password must be between')) {
                Alert.alert('Hiba', 'A megadott jelszó túl rövid.')
            } else if (message.includes('Rate limit for the current endpoint has been exceeded.')) {
                Alert.alert('Hiba', 'Túl sok sikertelen belépési kísérlet történt.\nKérlek próbálkozz később, vagy vedd fel a kapcsolatot az étteremmel.')
            } else {
                Alert.alert('Hiba', 'Valami hiba történt a bejelentkezés során.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="surface-card mt-2 gap-4 p-4 h-fit w-full md:w-3/4 mx-auto pt-12 pb-24">
            <View className="gap-7">
                <CustomInput
                    placeholder="Add meg az emailed"
                    value={form.email}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                    label="Email"
                    keyboardType="email-address"
                />
                <CustomInput
                    placeholder="Add meg a jelszavad"
                    value={form.password}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                    label="Jelszó"
                    secureTextEntry={true}
                />
            </View>

            <CustomButton
                title="Bejelentkezés"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-2 flex-row gap-2">
                <Text className="base-regular">
                    Nincs még fiókod?
                </Text>
                <Link href="/sign-up" className="base-bold text-brand-primary">
                    Regisztráció
                </Link>
            </View>
        </View>
    )
}

export default SignIn
