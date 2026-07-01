import { $api } from "@/lib/api/client";
import { deserializeClass } from "@/lib/serialization/deserializers";
import { deepMerge } from "@/lib/utils/objectUtils";
import { RezervoClass } from "@/types/chain";

export function useLiveClassData(chainIdentifier: string, _class: RezervoClass) {
    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/classes/{chain_identifier}/{class_id}",
        { params: { path: { chain_identifier: chainIdentifier, class_id: _class.id } } },
        { refetchInterval: 10 * 1000 },
    );

    const liveClassData = data ? deepMerge(_class, deserializeClass(data)) : _class;

    return {
        liveClassData,
        classDataError: error,
        classDataIsLoading: isLoading,
    };
}
