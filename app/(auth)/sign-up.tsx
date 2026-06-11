import { Link, router } from "expo-router";
import { Alert, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useState } from "react";

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ lastName: '', firstName: '', email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();

    const submit = async () => {
        const { lastName, firstName, email, password } = form;

        if (!lastName || !firstName || !email || !password) {
            return Alert.alert('Hiba', 'A vezetéknév, keresztnév, e-mail és jelszó megadása kötelező.');
        }

        setIsSubmitting(true)

        try {
            await createUser({ email, password, firstName, lastName });
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch (error: any) {
            Alert.alert('Hiba', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="surface-card mt-2 gap-4 p-4 w-full h-fit md:w-3/4 mx-auto pt-12 pb-24">
            <View className="gap-7">
                <CustomInput
                    placeholder="Add meg a vezetékneved"
                    value={form.lastName}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, lastName: text }))}
                    label="Vezetéknév"
                />
                <CustomInput
                    placeholder="Add meg a keresztneved"
                    value={form.firstName}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, firstName: text }))}
                    label="Keresztnév"
                />
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
                title="Regisztráció"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-2 flex-row gap-2">
                <Text className="base-regular">
                    Van már fiókod?
                </Text>
                <Link href="/sign-in" className="base-bold text-brand-primary">
                    Bejelentkezés
                </Link>
            </View>
        </View>
    )
}

export default SignUp
