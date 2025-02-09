"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";

export const SWRCacheInjector = <T,>({ cacheData }: { cacheData: Record<string, T> }) => {
    const { mutate } = useSWRConfig();

    useEffect(() => {
        for (const [key, value] of Object.entries(cacheData)) {
            mutate(key, value);
        }
    }, [mutate, cacheData]);

    return null;
};
