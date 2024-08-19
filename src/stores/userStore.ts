import { create } from "zustand";

interface MyUserState {
    userId: string | null;
    setUserId: (userId: string) => void;
    userName: string | null;
    setUserName: (userName: string) => void;
}

export const useMyUser = create<MyUserState>((set) => ({
    userId: null,
    setUserId: (userId: string) => set({ userId }),
    userName: null,
    setUserName: (userName: string) => set({ userName }),
}));

interface MyAvatarState {
    lastModifiedTimestamp: number;
    updateLastModifiedTimestamp: () => void;
}

export const useMyAvatar = create<MyAvatarState>((set) => ({
    lastModifiedTimestamp: Date.now(),
    updateLastModifiedTimestamp: () => set({ lastModifiedTimestamp: Date.now() }),
}));
