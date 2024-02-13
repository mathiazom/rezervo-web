export const fetcher = async <TData>(key: RequestInfo | URL, init?: RequestInit): Promise<TData> => {
    const r = await fetch(key, init);
    if (r.ok) {
        return r.json();
    }
    throw {
        statusText: r.statusText,
        status: r.status,
    };
};
