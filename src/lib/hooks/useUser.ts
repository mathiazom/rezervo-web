import { Session } from "next-auth";
import { useSession } from "next-auth/react";

type TokenSession = Session & {
    accessToken: string;
};

export function useUser(): {
    isAuthenticated: boolean;
    authStatus: "authenticated" | "loading" | "unauthenticated";
    token: string | null;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
} {
    const { status, data } = useSession();
    if (data?.user === undefined || !("accessToken" in data)) {
        return {
            isAuthenticated: false,
            authStatus: status,
            token: null,
        };
    }
    return {
        isAuthenticated: status === "authenticated",
        authStatus: status,
        token: (data as TokenSession).accessToken,
        user: data.user,
    };
}
