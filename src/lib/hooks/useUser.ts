import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";

export function useUser(): {
    isAuthenticated: boolean;
    authStatus: "authenticated" | "loading" | "unauthenticated";
    token: string | null;
    user?: {
        name?: string | null;
        email?: string | null;
    };
    logIn: IAuthContext["logIn"];
    logOut: IAuthContext["logOut"];
} {
    const { token, tokenData, loginInProgress, logIn, logOut } = useContext<IAuthContext>(AuthContext);

    // TODO: handle missing data
    // if (data?.user === undefined || !("accessToken" in data) || !("expiresAt" in data)) {
    //     return {
    //         isAuthenticated: false,
    //         authStatus: status,
    //         token: null,
    //     };
    // }
    // if (!isCustomSession(data)) {
    //     return {
    //         isAuthenticated: false,
    //         authStatus: status,
    //         token: null,
    //     };
    // }
    // if (data.error) {
    //     // TODO: better error handling
    //     return {
    //         isAuthenticated: false,
    //         authStatus: status,
    //         token: null,
    //     };
    // }
    // if (data.expiresAt && data.expiresAt < Date.now()) {
    //     return {
    //         isAuthenticated: false,
    //         authStatus: status === "loading" ? "loading" : "unauthenticated",
    //         token: null,
    //     };
    // }
    const authStatus = loginInProgress ? "loading" : token ? "authenticated" : "unauthenticated";
    return {
        isAuthenticated: authStatus === "authenticated",
        authStatus: authStatus,
        token,
        user: {
            email: tokenData?.["email"],
            name: tokenData?.["name"],
        },
        logIn,
        logOut,
    };
}
