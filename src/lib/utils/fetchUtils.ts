import { getSession } from "next-auth/react";

import { createRequest } from "@/lib/helpers/requests";

export const fetcher = async <TData>(path: string, init?: RequestInit): Promise<TData> => {
    const s = await getSession();
    const token = s != null && "accessToken" in s ? s.accessToken : null;
    let requestInit = init;
    if (token) {
        const headers = requestInit?.headers ? new Headers(requestInit.headers) : new Headers();
        headers.set("Authorization", `Bearer ${token}`);
        requestInit = Object.assign(requestInit ?? {}, { headers });
    }
    const r = await createRequest(path, requestInit, { mode: "client" });
    if (r.ok) {
        return r.json();
    }
    throw {
        statusText: r.statusText,
        status: r.status,
    };
};
