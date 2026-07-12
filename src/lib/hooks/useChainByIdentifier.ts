import { $api } from "@/lib/api/client";

// Unlike useChain(), this does not assume the chain has been seeded by the current route's loader
// (and so does not throw) — for looking up a chain that may differ from the one currently routed to.
export function useChainByIdentifier(chainIdentifier: string) {
    const { data: chain } = $api.useQuery("get", "/chains/{chain_identifier}", {
        params: { path: { chain_identifier: chainIdentifier } },
    });
    return chain ?? null;
}
