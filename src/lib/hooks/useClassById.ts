import { $api } from "@/lib/api/client";
import { deserializeClass } from "@/lib/serialization/deserializers";

export function useClassById(chainIdentifier: string, classId: string | undefined) {
    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/classes/{chain_identifier}/{class_id}",
        { params: { path: { chain_identifier: chainIdentifier, class_id: classId ?? "" } } },
        { enabled: classId != null, select: deserializeClass },
    );

    return { _class: data ?? null, error, isLoading };
}
