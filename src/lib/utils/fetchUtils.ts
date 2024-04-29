import { createRequest } from "@/lib/helpers/requests";

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
