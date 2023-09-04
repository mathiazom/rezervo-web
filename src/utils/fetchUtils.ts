// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetcher<JSON = any>(input: any, init?: any): Promise<JSON> {
    return fetch(input, init).then((r) => {
        if (r.ok) {
            return r.json();
        }
        throw {
            statusText: r.statusText,
            status: r.status,
        };
    });
}
