import { getRouteApi } from "@tanstack/react-router";

import { CLASS_CHAIN_QUERY_PARAM, CLASS_ID_QUERY_PARAM } from "@/lib/consts";
import { useClassById } from "@/lib/hooks/useClassById";

const routeApi = getRouteApi("/$chain");

export function useOpenClassInfo() {
    const { chain: viewedChainIdentifier } = routeApi.useParams();
    const navigate = routeApi.useNavigate();
    return (chainIdentifier: string, classId: string) => {
        void navigate({
            search: (prev) => ({
                ...prev,
                [CLASS_ID_QUERY_PARAM]: classId,
                [CLASS_CHAIN_QUERY_PARAM]: chainIdentifier === viewedChainIdentifier ? undefined : chainIdentifier,
            }),
            replace: true,
        });
    };
}

export function useClassInfo() {
    const { chain: viewedChainIdentifier } = routeApi.useParams();
    const { [CLASS_ID_QUERY_PARAM]: classId, [CLASS_CHAIN_QUERY_PARAM]: classChainIdentifier } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const chainIdentifier = classChainIdentifier ?? viewedChainIdentifier;
    const { _class, isLoading, error } = useClassById(chainIdentifier, classId);

    const closeClassInfo = () => {
        void navigate({
            search: (prev) => ({
                ...prev,
                [CLASS_ID_QUERY_PARAM]: undefined,
                [CLASS_CHAIN_QUERY_PARAM]: undefined,
            }),
            replace: true,
        });
    };

    return {
        classInfoClass: classId ? _class : null,
        classInfoChainIdentifier: classId ? chainIdentifier : null,
        classInfoLoading: classId != null && isLoading,
        classInfoError: error,
        closeClassInfo,
    };
}
