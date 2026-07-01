import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import IndexPage from "@/components/IndexPage";
import { serverApiClient } from "@/lib/api/client";

const getSelectedChainCookie = createServerFn({ method: "GET" }).handler(() => {
    return getCookie("rezervo.selectedChain") ?? null;
});

const getChainProfiles = createServerFn({ method: "GET" }).handler(async () => {
    const { data } = await serverApiClient.GET("/chains");
    return data!.map((c) => c.profile);
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
    loader: () => getChainProfiles(),
    component: IndexRoute,
});

function IndexRoute() {
    const chainProfiles = Route.useLoaderData();
    return <IndexPage chainProfiles={chainProfiles} />;
}
