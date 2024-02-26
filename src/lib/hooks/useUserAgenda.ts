import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { deserializeUserAgenda } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { UserAgendaClassDTO } from "@/types/serialization";

export function useUserAgenda() {
    const { user } = useUser();

    const userAgendaApiUrl = `/api/user/agenda`;

    const { data, mutate } = useSWR<UserAgendaClassDTO[]>(user ? userAgendaApiUrl : null, fetcher);

    return {
        userAgenda: data ? deserializeUserAgenda(data) : null,
        mutateUserAgenda: mutate,
    };
}
