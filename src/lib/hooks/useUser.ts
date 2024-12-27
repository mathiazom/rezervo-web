import { useSession } from "next-auth/react";

import { isCustomSession } from "@/lib/helpers/auth/auth";

export function useUser(): {
    isAuthenticated: boolean;
    authStatus: "authenticated" | "loading" | "unauthenticated";
    token: string | null;
    user?: {
        name?: string | null;
        email?: string | null;
    };
} {
    const { status, data } = useSession();
    if (data?.user === undefined || !("accessToken" in data) || !("expiresAt" in data)) {
        return {
            isAuthenticated: false,
            authStatus: status,
            token: null,
        };
    }
    if (!isCustomSession(data)) {
        return {
            isAuthenticated: false,
            authStatus: status,
            token: null,
        };
    }
    if (data.error) {
        // TODO: better error handling
        return {
            isAuthenticated: false,
            authStatus: status,
            token: null,
        };
    }
    if (data.expiresAt && data.expiresAt < Date.now()) {
        return {
            isAuthenticated: false,
            authStatus: status === "loading" ? "loading" : "unauthenticated",
            token: null,
        };
    }
    return {
        isAuthenticated: status === "authenticated",
        authStatus: status,
        token: data.accessToken,
        user: data.user,
    };
}
