import { create } from "zustand";

interface MyUserIdState {
    userId: string | null;
    setUserId: (userId: string) => void;
}

export const useMyUserId = create<MyUserIdState>((set) => ({
    userId: null,
    setUserId: (userId: string) => set({ userId }),
}));

interface MyAvatarState {
    lastModifiedTimestamp: number;
    updateLastModifiedTimestamp: () => void;
}

export const useMyAvatar = create<MyAvatarState>((set) => ({
    lastModifiedTimestamp: Date.now(),
    updateLastModifiedTimestamp: () => set({ lastModifiedTimestamp: Date.now() }),
}));
