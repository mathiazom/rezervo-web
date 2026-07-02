import { useDeferredValue, useEffect, useState } from "react";

import {
    getStoredExcludeClassTimeFilters,
    getStoredSelectedCategories,
    getStoredSelectedLocations,
    storeExcludeClassTimeFilters,
    storeSelectedCategories,
    storeSelectedLocations,
} from "@/lib/helpers/storage";
import { ActivityCategory, ExcludeClassTimeFiltersType } from "@/types/local";

export function useScheduleFilters(
    chainIdentifier: string,
    activityCategories: ActivityCategory[],
    initialLocationIds: string[],
    defaultLocationIds: string[],
) {
    const [selectedLocationIds, setSelectedLocationIdsState] = useState<string[]>(initialLocationIds);
    const deferredSelectedLocationIds = useDeferredValue(selectedLocationIds);
    const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(
        activityCategories.map((ac) => ac.name),
    );
    const deferredSelectedCategories = useDeferredValue(selectedCategories);
    const [excludeClassTimeFilters, setExcludeClassTimeFiltersState] = useState<ExcludeClassTimeFiltersType>({
        enabled: true,
        filters: [],
    });

    useEffect(() => {
        setSelectedLocationIdsState(getStoredSelectedLocations(chainIdentifier) ?? defaultLocationIds);
        setSelectedCategoriesState(
            getStoredSelectedCategories(chainIdentifier) ?? activityCategories.map((ac) => ac.name),
        );
        setExcludeClassTimeFiltersState(getStoredExcludeClassTimeFilters() ?? { enabled: true, filters: [] });
    }, [chainIdentifier, defaultLocationIds, activityCategories]);

    const setSelectedLocationIds = (value: string[]) => {
        setSelectedLocationIdsState(value);
        storeSelectedLocations(chainIdentifier, value);
    };
    const setSelectedCategories = (value: string[]) => {
        setSelectedCategoriesState(value);
        storeSelectedCategories(chainIdentifier, value);
    };
    const setExcludeClassTimeFilters = (value: ExcludeClassTimeFiltersType) => {
        setExcludeClassTimeFiltersState(value);
        storeExcludeClassTimeFilters(value);
    };

    return {
        selectedLocationIds,
        setSelectedLocationIds,
        deferredSelectedLocationIds,
        selectedCategories,
        setSelectedCategories,
        deferredSelectedCategories,
        excludeClassTimeFilters,
        setExcludeClassTimeFilters,
    };
}
