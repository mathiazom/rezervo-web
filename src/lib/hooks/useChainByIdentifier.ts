import { $api } from "@/lib/api/client";
import { ChainId } from "@/types/brand";
import { brandRezervoChain } from "@/types/openapi";

// Unlike useChain(), this does not assume the chain has been seeded by the current route's loader
// (and so does not throw) — for looking up a chain that may differ from the one currently routed to.
export function useChainByIdentifier(chainIdentifier: ChainId) {
    const { data: chain } = $api.useQuery(
        "get",
        "/chains/{chain_identifier}",
        { params: { path: { chain_identifier: chainIdentifier } } },
        { select: brandRezervoChain },
    );
    return chain ?? null;
}
