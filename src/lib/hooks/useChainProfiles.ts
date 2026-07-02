import { $api } from "@/lib/api/client";
import { ChainProfile, RezervoChain } from "@/types/openapi";

const selectChainProfiles = (chains: RezervoChain[]): ChainProfile[] => chains.map((chain) => chain.profile);
export function useChainProfiles() {
    const { data } = $api.useQuery("get", "/chains", {}, { select: selectChainProfiles });
    return data ?? [];
}
