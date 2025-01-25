import useSWR from "swr";

import { deserializeClass } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { deepMerge } from "@/lib/utils/objectUtils";
import { RezervoClass } from "@/types/chain";
import { RezervoClassDTO } from "@/types/serialization";

export function useLiveClassData(chainIdentifier: string, _class: RezervoClass) {
    const { data, error, isLoading } = useSWR<RezervoClass>(
        `classes/${chainIdentifier}/${_class.id}`,
        async (url, opts) => {
            const dto = await fetcher<RezervoClassDTO>(url, opts);
            return dto ? deserializeClass(dto) : dto;
        },
        {
            refreshInterval: 10 * 1000,
            fallbackData: _class,
        },
    );

    const liveClassData = data ? deepMerge(_class, data) : _class;

    return {
        liveClassData,
        classDataError: error,
        classDataIsLoading: isLoading,
    };
}
