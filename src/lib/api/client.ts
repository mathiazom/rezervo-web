import createFetchClient, { type Middleware } from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";

import type { paths } from "@/types/api";

let authToken: string | null = null;
export function setApiAuthToken(token: string | null) {
    authToken = token;
}

const injectAuthToken: Middleware = {
    onRequest({ request }) {
        if (typeof window === "undefined") {
            throw new Error(
                "apiClient must not be used server-side — its auth token is a client-only module-level global set " +
                    "after hydration, so a server-side call would run unauthenticated or leak a token across " +
                    "unrelated requests. Use serverApiClient in server functions/routes instead.",
            );
        }
        if (authToken != null) {
            request.headers.set("Authorization", `Bearer ${authToken}`);
        }
        return request;
    },
};

export const serverApiClient = createFetchClient<paths>({
    baseUrl: process.env["INTERNAL_CONFIG_HOST"] ?? import.meta.env.VITE_CONFIG_HOST,
});

// Browser-only: apiClient's auth token lives in the module-level `authToken` variable above, which is
// only ever mutated client-side (see ApiAuthTokenSync in authProvider.tsx, gated to run after hydration).
// Importing/calling this from server functions/routes would hit the guard in injectAuthToken above.
export const apiClient = createFetchClient<paths>({ baseUrl: import.meta.env.VITE_CONFIG_HOST });
apiClient.use(injectAuthToken);

export const $api = createReactQueryClient(apiClient);
