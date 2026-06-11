import {
    CreateUserParams,
    CreateMenuItemParams,
    CreateCustomizationParams,
    GetCustomizationsByCategoryParams,
    GetItemByIdParams,
    GetItemParams,
    OrderDocument,
    SignInParams,
    UpdateProfileParams,
} from "@/type";
import { Account, Avatars, Client, Databases, Functions, ID, Permission, Query, Role, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string,
    platform: process.env.EXPO_PUBLIC_BUNDLE_ID as string,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string,
    databaseId: process.env.EXPO_PUBLIC_DATABASE_ID as string,
    bucketId: process.env.EXPO_PUBLIC_BUCKET_ID as string,
    userTableId: process.env.EXPO_PUBLIC_USERTABLE_ID as string,
    itemTableId: process.env.EXPO_PUBLIC_ITEMS_ID as string,
    categoriesTableId: process.env.EXPO_PUBLIC_CATEGORIES_ID as string,
    customizationTableId: process.env.EXPO_PUBLIC_CUSTOM_ID as string,
    ordersTableId: process.env.EXPO_PUBLIC_ORDERS_ID as string,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeCheckoutFunctionId: process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_FUNCTION_ID,
    stripeMerchantName: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_NAME || "Pizza Boi",
    cloudinaryApiKey: process.env.EXPO_PUBLIC_CLOUDINARY_KEY,
    cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinarySignFunctionId: process.env.EXPO_PUBLIC_CLOUDINARY_SIGN_FUNCTION_ID,
}

export const client = new Client();

const hasValidAppwriteConfig =
    !!appwriteConfig.endpoint &&
    !!appwriteConfig.projectId &&
    !!appwriteConfig.platform;

if (hasValidAppwriteConfig) {
    client
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId)
        .setPlatform(appwriteConfig.platform);
} else {
    console.error(
        "[Appwrite] Hiányzó env változó(k): EXPO_PUBLIC_APPWRITE_ENDPOINT / EXPO_PUBLIC_APPWRITE_PROJECT_ID / EXPO_PUBLIC_BUNDLE_ID"
    );
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, firstName, lastName }: CreateUserParams) => {
    try {
        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();

        const newAccount = await account.create(ID.unique(), email, password, normalizedFirstName)
        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(normalizedFirstName);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            ID.unique(),
            {
                email,
                accountId: newAccount.$id,
                avatar: avatarUrl,
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
            }
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession("current");
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        const document = currentUser.documents[0];
        return {
            ...document,
            labels: currentAccount.labels ?? [],
        };
    } catch (e) {
        // No active session => treat as unauthenticated state, not a hard error.
        const maybeAppwriteError = e as { code?: number; type?: string };
        if (
            maybeAppwriteError?.code === 401 ||
            maybeAppwriteError?.type === "general_unauthorized_scope" ||
            maybeAppwriteError?.type === "user_unauthorized"
        ) {
            return null;
        }
        throw new Error(e as string);
    }
}

const hasAdminLabel = (labels: unknown) =>
    Array.isArray(labels) && labels.includes("admin");

const ensureAdminWriteAccess = async () => {
    const currentAccount = await account.get();

    if (!hasAdminLabel(currentAccount.labels)) {
        throw new Error("Nincs jogosultságod ehhez a művelethez.");
    }

    return currentAccount;
};

export const updateCurrentUserProfile = async ({
    firstName,
    lastName,
    city,
    street,
    houseNumber,
    floorDoor,
    phone,
}: UpdateProfileParams) => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        const document = currentUser.documents[0];
        if (!document) throw Error;

        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            document.$id,
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                city: city.trim(),
                street: street.trim(),
                houseNumber: houseNumber.trim(),
                floorDoor: floorDoor.trim(),
                phone: phone.trim(),
            }
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

type AvatarUploadFile = {
    uri: string;
    name: string;
    type: string;
    size: number;
};

const getCurrentUserDocument = async () => {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userTableId,
        [Query.equal("accountId", currentAccount.$id)]
    );

    const document = currentUser.documents[0];
    if (!document) throw Error;

    return { document, currentAccount };
};

const buildStorageViewUrl = (fileId: string) => {
    const endpoint = appwriteConfig.endpoint.replace(/\/+$/, "");
    return `${endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
};

const extractFileIdFromAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    const match = avatarUrl.match(/\/files\/([^/]+)\/view/);
    return match?.[1] ?? null;
};

export const updateCurrentUserAvatar = async (file: AvatarUploadFile) => {
    try {
        const { document: currentUser, currentAccount } = await getCurrentUserDocument();
        const avatarFileId = `avatar_${currentAccount.$id}`;
        const previousAvatarFileId = extractFileIdFromAvatarUrl(
            typeof currentUser.avatar === "string" ? currentUser.avatar : undefined
        );

        if (previousAvatarFileId && previousAvatarFileId !== avatarFileId) {
            try {
                await storage.deleteFile({
                    bucketId: appwriteConfig.bucketId,
                    fileId: previousAvatarFileId,
                });
            } catch {
                // Could be non-Appwrite URL or already deleted.
            }
        }

        try {
            await storage.deleteFile({
                bucketId: appwriteConfig.bucketId,
                fileId: avatarFileId,
            });
        } catch {
            // First upload or already removed file.
        }

        const uploaded = await storage.createFile({
            bucketId: appwriteConfig.bucketId,
            fileId: avatarFileId,
            file,
            permissions: [
                Permission.read(Role.any()),
                Permission.update(Role.user(currentAccount.$id)),
                Permission.delete(Role.user(currentAccount.$id)),
            ],
        });

        const avatarUrl = `${buildStorageViewUrl(uploaded.$id)}&v=${Date.now()}`;

        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            currentUser.$id,
            { avatar: avatarUrl }
        );

        return updatedUser;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getItem = async ({ category, query }: GetItemParams) => {
    try {
        const queries: string[] = [Query.limit(200)];

        if (category) queries.push(Query.equal('category', category));
        if (query) queries.push(Query.search('name', query));

        const items = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            queries,
        )

        return items.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesTableId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getItemById = async ({ id }: GetItemByIdParams) => {
    try {
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            id
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCustomizationsByCategory = async ({
    categoryId,
}: GetCustomizationsByCategoryParams) => {
    try {
        const queries: string[] = [Query.limit(200)];
        if (categoryId) queries.push(Query.equal("category", categoryId));

        const customizations = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            queries
        );

        return customizations.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCustomizations = async () => {
    try {
        const customizations = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            [Query.limit(500)]
        );

        return customizations.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCustomizationById = async ({ id }: { id: string }) => {
    try {
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            id
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUserOrders = async () => {
    try {
        if (!appwriteConfig.ordersTableId) {
            throw new Error("Hiányzik az EXPO_PUBLIC_ORDERS_ID beállítás.");
        }

        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersTableId,
            [
                Query.equal("userId", currentAccount.$id),
                Query.orderDesc("$createdAt"),
                Query.limit(100),
            ]
        );

        return orders.documents as unknown as OrderDocument[];
    } catch (e) {
        throw new Error(e as string);
    }
}

export const createMenuItem = async ({
    name,
    description,
    imageUrl,
    price,
    categoryId,
}: CreateMenuItemParams) => {
    try {
        await ensureAdminWriteAccess();

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            ID.unique(),
            {
                name: name.trim(),
                description: description.trim(),
                image_url: imageUrl.trim(),
                price,
                category: categoryId,
            },
            [
                Permission.read(Role.any()),
                Permission.update(Role.label("admin")),
                Permission.delete(Role.label("admin")),
            ]
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

export const updateMenuItem = async ({
    id,
    name,
    description,
    imageUrl,
    price,
    categoryId,
}: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    categoryId: string;
}) => {
    try {
        await ensureAdminWriteAccess();

        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            id,
            {
                name: name.trim(),
                description: description.trim(),
                image_url: imageUrl.trim(),
                price,
                category: categoryId,
            }
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

export const deleteMenuItem = async ({ id }: { id: string }) => {
    try {
        await ensureAdminWriteAccess();

        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            id
        );
        return true;
    } catch (e) {
        throw new Error(e as string);
    }
};

export const createCustomization = async ({
    name,
    price,
    type,
    categoryId,
}: CreateCustomizationParams) => {
    try {
        await ensureAdminWriteAccess();

        let targetCategoryId = categoryId;

        if (!targetCategoryId) {
            const categories = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesTableId,
                [Query.limit(200)]
            );

            const pizzaCategory = categories.documents.find((category) => {
                const categoryName = String((category as any).name ?? "").toLowerCase();
                return categoryName === "pizzák" || categoryName.includes("pizza");
            });

            if (!pizzaCategory?.$id) {
                throw new Error("Nem található a Pizzák kategória.");
            }

            targetCategoryId = pizzaCategory.$id;
        }

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            ID.unique(),
            {
                name: name.trim(),
                price,
                type,
                category: targetCategoryId,
            },
            [
                Permission.read(Role.any()),
                Permission.update(Role.label("admin")),
                Permission.delete(Role.label("admin")),
            ]
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

export const updateCustomization = async ({
    id,
    name,
    price,
    type,
}: {
    id: string;
    name: string;
    price: number;
    type: "size" | "topping" | "side";
}) => {
    try {
        await ensureAdminWriteAccess();

        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            id,
            {
                name: name.trim(),
                price,
                type,
            }
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

export const deleteCustomization = async ({ id }: { id: string }) => {
    try {
        await ensureAdminWriteAccess();

        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            id
        );
        return true;
    } catch (e) {
        throw new Error(e as string);
    }
};
