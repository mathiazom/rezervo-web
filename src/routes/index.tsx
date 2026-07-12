import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { $api, serverApiClient } from "@/lib/api/client";
import LandingPage from "@/components/LandingPage";
import { SELECTED_CHAIN_COOKIE_KEY } from "@/lib/helpers/storage";

const getSelectedChainCookie = createServerFn({ method: "GET" }).handler(() => {
    return getCookie(SELECTED_CHAIN_COOKIE_KEY) ?? null;
});

const getChains = createServerFn({ method: "GET" }).handler(async () => {
    const { data } = await serverApiClient.GET("/chains");
    return data;
});

export const Route = createFileRoute("/")({
    validateSearch: z.object({
        code: z.string().optional(),
        state: z.string().optional(),
        error: z.string().optional(),
    }),
    beforeLoad: async ({ search }) => {
        // Prevent redirect when receiving login code
        if (search.code || search.error) {
            return;
        }
        const selectedChain = await getSelectedChainCookie();
        if (selectedChain) {
            throw redirect({ to: "/$chain", params: { chain: selectedChain } });
        }
    },
    loader: async ({ context: { queryClient } }) => {
        queryClient.setQueryData($api.queryOptions("get", "/chains", {}).queryKey, await getChains());
    },
    component: () => {
        return <LandingPage />;
    },
});
