import { useQuery } from "@tanstack/react-query";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { FetchError } from "@/lib/utils/fetchUtils";

interface MyUser {
    id: string;
    name: string;
}

export function useMyUser() {
    const { isAuthenticated, token } = useUser();

    const { data } = useQuery<MyUser, FetchError>({
        queryKey: ["my-user"],
        queryFn: async (): Promise<MyUser> => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const res = await put("user", { accessToken: token! });
            if (!res.ok) {
                throw { status: res.status, statusText: res.statusText } as FetchError;
            }
            return await res.json();
        },
        enabled: isAuthenticated && token != null,
        staleTime: Infinity,
    });

    return {
        userId: data?.id ?? null,
        userName: data?.name ?? null,
    };
}
