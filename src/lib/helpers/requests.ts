import { HTTP_METHOD } from "next/dist/server/web/http";

function createRequestInit(
    method: HTTP_METHOD,
    accessToken?: string,
    body?: BodyInit,
    contentType: string | null = "application/json",
    cache?: RequestCache,
): RequestInit {
    const headers = new Headers();
    const requestInit: RequestInit = {
        method,
        headers,
    };
    if (accessToken) {
        headers.append("Authorization", `Bearer ${accessToken}`);
    }
    if (contentType) {
        headers.append("Content-Type", contentType);
    }
    if (body) {
        requestInit.body = body;
    }
    if (cache) {
        requestInit.cache = cache;
    }
    return requestInit;
}

function buildBackendPath(path: string): string {
    const host = process.env["INTERNAL_CONFIG_HOST"] ?? process.env["NEXT_PUBLIC_CONFIG_HOST"];
    return `${host}/${path}`;
}

export function buildBackendAuthProxyPath(path: string): string {
    return `/api/${path}`;
}

function createRequest(path: string, requestInit: RequestInit, authProxyRequired?: boolean): Promise<Response> {
    return fetch(authProxyRequired ? buildBackendAuthProxyPath(path) : buildBackendPath(path), requestInit);
}

export function get(path: string, accessToken?: string, skipAuthProxy?: boolean): Promise<Response> {
    return createRequest(
        path,
        createRequestInit("GET", accessToken, undefined, undefined, "no-store"),
        !accessToken && !skipAuthProxy,
    );
}

export function put(
    path: string,
    body?: BodyInit,
    contentType?: string | null,
    accessToken?: string,
): Promise<Response> {
    return createRequest(path, createRequestInit("PUT", accessToken, body, contentType), !accessToken);
}

export function post(
    path: string,
    body?: BodyInit,
    contentType?: string | null,
    accessToken?: string,
): Promise<Response> {
    return createRequest(path, createRequestInit("POST", accessToken, body, contentType), !accessToken);
}

export function destroy(
    path: string,
    body?: BodyInit,
    contentType?: string | null,
    accessToken?: string,
): Promise<Response> {
    return createRequest(path, createRequestInit("DELETE", accessToken, body, contentType), !accessToken);
}
