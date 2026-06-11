import { Models } from "react-native-appwrite";

export interface MenuItem extends Models.Document {
    name: string;
    price: number;
    image_url: string;
    description: string;
    type: string;
    category?: string | Models.Document;
}

export interface Customization extends Models.Document {
    name: string;
    price: number;
    type: "topping" | "side" | "size";
    category?: string | Models.Document;
}

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface User extends Models.Document {
    email: string;
    avatar: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    floorDoor?: string;
    phone?: string;
}

export interface OrderLineItem {
    itemId: string;
    name: string;
    quantity: number;
    unitBasePriceHuf: number;
    customizations?: {
        id: string;
        name: string;
        type: string;
        priceHuf: number;
    }[];
    note?: string;
    lineTotalHuf: number;
    isPromoGift?: boolean;
    promoCode?: string;
}

export interface OrderDocument extends Models.Document {
    userId: string;
    orderId: string;
    status: "pending" | "paid" | "failed" | string;
    customerName: string;
    phone: string;
    city: string;
    street: string;
    houseNumber: string;
    floorDoor?: string;
    itemCount: number;
    itemsJson: string;
    subtotalHuf: number;
    discountHuf: number;
    deliveryFeeHuf: number;
    totalHuf: number;
}

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
}

export interface CartItemType {
    id: string; // menu item id
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    customizations?: CartCustomization[];
    note?: string;
    isPromoGift?: boolean;
    promoCode?: string;
}

export interface CartStore {
    items: CartItemType[];
    addItem: (item: Omit<CartItemType, "quantity">) => void;
    removeItem: (id: string, customizations: CartCustomization[], note?: string) => void;
    increaseQty: (id: string, customizations: CartCustomization[], note?: string) => void;
    decreaseQty: (id: string, customizations: CartCustomization[], note?: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
    loadingColor?: string;
}

interface CustomHeaderProps {
    title?: string;
    onBackPress?: () => void;
    rightSlot?: React.ReactNode;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface GetItemParams {
    category: string;
    query: string;
}

interface GetItemByIdParams {
    id: string;
}

interface GetCustomizationsByCategoryParams {
    categoryId: string;
}

export interface CreateMenuItemParams {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    categoryId: string;
}

export interface CreateCustomizationParams {
    name: string;
    price: number;
    type: "topping" | "side";
    categoryId?: string;
}

export interface UpdateProfileParams {
    firstName: string;
    lastName: string;
    city: string;
    street: string;
    houseNumber: string;
    floorDoor: string;
    phone: string;
}

export interface StripeCheckoutProfileStatus {
    isValid: boolean;
    missingAddress: boolean;
    missingPhone: boolean;
}
