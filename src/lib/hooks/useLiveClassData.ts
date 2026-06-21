import { useQuery } from "@tanstack/react-query";

import { deserializeClass } from "@/lib/serialization/deserializers";
import { fetcher, FetchError } from "@/lib/utils/fetchUtils";
import { deepMerge } from "@/lib/utils/objectUtils";
import { RezervoClass } from "@/types/chain";
import { RezervoClassDTO } from "@/types/serialization";

export function useLiveClassData(chainIdentifier: string, _class: RezervoClass) {
    const { data, error, isLoading } = useQuery<RezervoClass, FetchError>({
        queryKey: [`classes/${chainIdentifier}/${_class.id}`],
        queryFn: async () => {
            const dto = await fetcher<RezervoClassDTO>(`classes/${chainIdentifier}/${_class.id}`);
            return deserializeClass(dto);
        },
        refetchInterval: 10 * 1000,
        placeholderData: _class,
    });

    const liveClassData = data ? deepMerge(_class, data) : _class;

    return {
        liveClassData,
        classDataError: error,
        classDataIsLoading: isLoading,
    };
}
