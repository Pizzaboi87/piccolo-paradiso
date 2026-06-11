import { CartCustomization, CartStore } from "@/type";
import { create } from "zustand";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

function areNotesEqual(a?: string, b?: string): boolean {
    return (a ?? "").trim() === (b ?? "").trim();
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => {
        const customizations = item.customizations ?? [];
        const note = item.note?.trim() ?? "";

        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations) &&
                areNotesEqual(i.note, note)
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations) &&
                        areNotesEqual(i.note, note)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });
        } else {
            set({
                items: [...get().items, { ...item, quantity: 1, customizations, note }],
            });
        }
    },

    removeItem: (id, customizations = [], note = "") => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations) &&
                        areNotesEqual(i.note, note)
                    )
            ),
        });
    },

    increaseQty: (id, customizations = [], note = "") => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations) &&
                    areNotesEqual(i.note, note)
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, customizations = [], note = "") => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations) &&
                        areNotesEqual(i.note, note)
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0),
}));
