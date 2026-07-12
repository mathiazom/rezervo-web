import { $api } from "@/lib/api/client";
import { ActivityCategory } from "@/types/openapi";

export function useActivityCategories(): ActivityCategory[] {
    const { data } = $api.useQuery("get", "/categories", {});
    return data ?? [];
}
