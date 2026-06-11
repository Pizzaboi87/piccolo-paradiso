import { ID } from "react-native-appwrite";
import { appwriteConfig, databases } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size";
}

interface Item {
    name: string;
    description: string;
    image_url: string;
    price: number;
    category_name: string;
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    items: Item[];
}

// Ensure dummyData has the expected shape
const data = dummyData as DummyData;

const clearAll = async (collectionId: string): Promise<void> => {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(
                appwriteConfig.databaseId,
                collectionId,
                doc.$id
            )
        )
    );
};

const seed = async (): Promise<void> => {
    // Clear all related tables before reseeding
    await clearAll(appwriteConfig.categoriesTableId);
    await clearAll(appwriteConfig.customizationTableId);
    await clearAll(appwriteConfig.itemTableId);

    // Store created category document IDs by category name
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesTableId,
            ID.unique(),
            {
                name: cat.name,
                description: cat.description,
            }
        );

        categoryMap[cat.name] = doc.$id;
    }

    const defaultCustomizationCategoryId = categoryMap["Pizzák"];
    if (!defaultCustomizationCategoryId) {
        throw new Error('Missing "Pizzák" category for customization seeding.');
    }

    for (const cus of data.customizations) {
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationTableId,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
                category: defaultCustomizationCategoryId,
            }
        );
    }

    // Create items
    for (const item of data.items) {
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.itemTableId,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: item.image_url,
                price: item.price,
                category: categoryMap[item.category_name],
            }
        );
    }

    console.log("Seeding complete.");
};

export default seed;
