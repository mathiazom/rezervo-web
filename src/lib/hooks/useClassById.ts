import { $api } from "@/lib/api/client";
import { deserializeClass } from "@/lib/serialization/deserializers";
import { ChainId, ClassId } from "@/types/brand";

export function useClassById(chainIdentifier: ChainId, classId: ClassId | undefined) {
    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/classes/{chain_identifier}/{class_id}",
        { params: { path: { chain_identifier: chainIdentifier, class_id: classId ?? "" } } },
        { enabled: classId != null, select: deserializeClass },
    );

    return { _class: data ?? null, error, isLoading };
}
