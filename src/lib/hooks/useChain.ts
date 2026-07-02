import { getRouteApi } from "@tanstack/react-router";

import { $api } from "@/lib/api/client";
import { RezervoChain } from "@/types/openapi";

const routeApi = getRouteApi("/$chain");

export function useChain(): RezervoChain {
    const { chain: chainIdentifier } = routeApi.useParams();
    const { data: chain } = $api.useQuery("get", "/chains/{chain_identifier}", {
        params: { path: { chain_identifier: chainIdentifier } },
    });
    return chain!;
}
