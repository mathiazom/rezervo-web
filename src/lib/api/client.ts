import createFetchClient, { type Middleware } from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";

import type { paths } from "@/types/api";

let authToken: string | null = null;
export function setApiAuthToken(token: string | null) {
    authToken = token;
}

const injectAuthToken: Middleware = {
    onRequest({ request }) {
        if (authToken != null) {
            request.headers.set("Authorization", `Bearer ${authToken}`);
        }
        return request;
    },
};

export const serverApiClient = createFetchClient<paths>({
    baseUrl: process.env["INTERNAL_CONFIG_HOST"] ?? import.meta.env.VITE_CONFIG_HOST,
});

export const apiClient = createFetchClient<paths>({ baseUrl: import.meta.env.VITE_CONFIG_HOST });
apiClient.use(injectAuthToken);

export const $api = createReactQueryClient(apiClient);
