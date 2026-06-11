import AdminProductCard from "@/components/AdminProductCard";
import ItemSearchList from "@/components/ItemSearchList";
import { MenuItem } from "@/type";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminEditProductScreen() {
    return (
        <SafeAreaView className="screen">
            <ItemSearchList
                title="Termék szerkesztése"
                subtitle="Válassz terméket szerkesztéshez"
                renderCard={(item: MenuItem) => <AdminProductCard item={item} sourcePath="/admin/edit-product" />}
                emptyText="Nincs találat"
            />
        </SafeAreaView>
    );
}
