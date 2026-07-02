import { $api } from "@/lib/api/client";

export function useActivityCategories() {
    const { data } = $api.useQuery("get", "/categories", {});
    return data ?? [];
}
