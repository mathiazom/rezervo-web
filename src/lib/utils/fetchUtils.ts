import { createRequest } from "@/lib/helpers/requests";

// TODO: re-add token in requests
export const fetcher = async <TData>(path: string, init?: RequestInit): Promise<TData> => {
    const r = await createRequest(path, init, { mode: "client" });
    if (r.ok) {
        return r.json();
    }
    throw {
        statusText: r.statusText,
        status: r.status,
    };
};

export function authedFetcher(token: string): typeof fetcher {
    return (path: string, init?: RequestInit) =>
        fetcher(path, {
            ...init,
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
            },
        });
}
