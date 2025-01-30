import { useContext, useEffect, useState } from "react";
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
    const { token, idTokenData, loginInProgress, logIn, logOut } = useContext<IAuthContext>(AuthContext);

    const [ready, setReady] = useState(false);

    useEffect(() => {
        // give session retrieval some time before determining auth state
        // (prevents login button flickering on initial page load)
        const delayed = setTimeout(() => {
            setReady(true);
        }, 1000);
        return () => clearTimeout(delayed);
    }, []);

    const authStatus = loginInProgress ? "loading" : token ? "authenticated" : ready ? "unauthenticated" : "loading";

    return {
        isAuthenticated: authStatus === "authenticated",
        authStatus,
        token,
        user: {
            email: idTokenData?.["email"],
            name: idTokenData?.["preferred_username"],
        },
        logIn,
        logOut,
    };
}
