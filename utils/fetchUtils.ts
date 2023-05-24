export function fetcher<JSON = any>(input: any, init?: any): Promise<JSON> {
    return fetch(input, init).then((r) => r.json());
}
