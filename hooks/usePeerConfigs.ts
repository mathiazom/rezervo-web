import useSWR from "swr";
import { PeerConfig } from "../types/rezervoTypes";
import { fetcher } from "../utils/fetchUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

export function usePeerConfigs() {
    const { user } = useUser();

    const peerConfigsApiUrl = "/api/peer_configs";

    const { data, error, isLoading } = useSWR<PeerConfig[]>(user ? peerConfigsApiUrl : null, fetcher);

    return {
        peerConfigs: data,
        peerConfigsError: error,
        peerConfigsLoading: isLoading,
    };
}
