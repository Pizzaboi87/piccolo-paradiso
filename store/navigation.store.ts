import { create } from "zustand";

const normalizePath = (path?: string | null) => {
  if (!path) return "/";

  const withoutQuery = path.split("?")[0].split("#")[0].trim();
  if (!withoutQuery) return "/";

  const normalized = withoutQuery
    .replace(/^\/\(tabs\)/, "")
    .replace(/^\/index$/, "/");

  return normalized || "/";
};

type NavigationState = {
  trail: string[];
  pushSource: (path?: string | null) => void;
  consumeBackTarget: (currentPath: string, fallbackPath?: string) => string;
  clearTrail: () => void;
};

const useNavigationStore = create<NavigationState>((set, get) => ({
  trail: [],

  pushSource: (path) => {
    const normalized = normalizePath(path);
    if (normalized === "/cart") return;

    const currentTrail = get().trail;
    const last = currentTrail[currentTrail.length - 1];
    if (last === normalized) return;

    set({ trail: [...currentTrail, normalized].slice(-3) });
  },

  consumeBackTarget: (currentPath, fallbackPath = "/") => {
    const normalizedCurrent = normalizePath(currentPath);
    const normalizedFallback = normalizePath(fallbackPath);
    const nextTrail = [...get().trail];

    while (nextTrail.length > 0 && nextTrail[nextTrail.length - 1] === normalizedCurrent) {
      nextTrail.pop();
    }

    const target = nextTrail.length > 0 ? nextTrail[nextTrail.length - 1] : normalizedFallback;

    if (nextTrail.length > 0) {
      nextTrail.pop();
    }

    set({ trail: nextTrail });
    return target;
  },

  clearTrail: () => set({ trail: [] }),
}));

export default useNavigationStore;

