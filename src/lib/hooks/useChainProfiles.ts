import { $api } from "@/lib/api/client";
import { brandRezervoChain, ChainProfile, OpenApi } from "@/types/openapi";

const selectChainProfiles = (chains: OpenApi["ChainResponse"][]): ChainProfile[] =>
    chains.map((chain) => brandRezervoChain(chain).profile);
export function useChainProfiles() {
    const { data } = $api.useQuery("get", "/chains", {}, { select: selectChainProfiles });
    return data ?? [];
}
