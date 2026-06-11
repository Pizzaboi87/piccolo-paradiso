import CartButton from "@/components/CartButton";
import ItemSearchList from "@/components/ItemSearchList";
import ItemCard from "@/components/ItemCard";
import { MenuItem } from "@/type";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
    return (
        <SafeAreaView className="screen">
            <ItemSearchList
                title="Keresés"
                subtitle="Találd meg a kedvenc ételed"
                headerRight={<CartButton />}
                renderCard={(item: MenuItem) => <ItemCard item={item} />}
                emptyText="Nincs találat"
            />
        </SafeAreaView>
    )
}

export default Search
