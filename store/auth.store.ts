import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/type";
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setIsAdmin: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setIsAdmin: (value) => set({ isAdmin: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({ isLoading: value }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();

            if (user) {
                const labels = (user as any)?.labels;
                const hasAdminLabel = Array.isArray(labels) && labels.includes("admin");

                set({
                    isAuthenticated: true,
                    isAdmin: hasAdminLabel,
                    user: user as unknown as User,
                });
            } else set({ isAuthenticated: false, isAdmin: false, user: null });
        } catch (e) {
            set({ isAuthenticated: false, isAdmin: false, user: null })
        } finally {
            set({ isLoading: false });
        }
    }
}))

export default useAuthStore;
