import { getRouteApi } from "@tanstack/react-router";

import { $api } from "@/lib/api/client";
import { RezervoChain } from "@/types/openapi";

const routeApi = getRouteApi("/$chain");

export function useChain(): RezervoChain {
    const { chain: chainIdentifier } = routeApi.useParams();
    const { data: chain } = $api.useQuery("get", "/chains/{chain_identifier}", {
        params: { path: { chain_identifier: chainIdentifier } },
    });
    // The `$chain` route loader seeds this exact query (see src/routes/$chain.tsx) before this component
    // ever renders, so `chain` should always be defined here.
    if (chain == null) {
        throw new Error(`useChain() called without a seeded "${chainIdentifier}" chain query`);
    }
    return chain;
}
