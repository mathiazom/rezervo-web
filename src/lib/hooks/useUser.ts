import { useFusionAuth } from "@fusionauth/react-sdk";

export function useUser(): {
    isAuthenticated: boolean;
    authStatus: "authenticated" | "loading" | "unauthenticated";
    user?: {
        name: string | null;
        email: string | null;
    };
} {
    const { isLoggedIn, isFetchingUserInfo, userInfo } = useFusionAuth();

    // TODO: isLoggedIn will always be set to false when the access token expires, even if refresh is performed
    //       so assuming refreshing works, we are still logged in, but the SDK doesn't know that
    const isProbablyLoggedIn = isLoggedIn || userInfo != null;

    return {
        isAuthenticated: isProbablyLoggedIn,
        authStatus: isFetchingUserInfo ? "loading" : isProbablyLoggedIn ? "authenticated" : "unauthenticated",
        ...(userInfo
            ? {
                  user: {
                      // @ts-expect-error custom property not typed
                      name: userInfo["preferred_username"],
                      email: userInfo.email ?? null,
                  },
              }
            : {}),
    };
}
