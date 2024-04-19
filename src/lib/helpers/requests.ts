import { HTTP_METHOD } from "next/dist/server/web/http";

import { RequestOptions } from "@/types/requests";

function createRequestInit(method: HTTP_METHOD, options?: RequestOptions): RequestInit {
    const headers = new Headers();
    const requestInit: RequestInit = {
        method,
        headers,
    };
    if (options?.accessToken) {
        headers.append("Authorization", `Bearer ${options.accessToken}`);
    }
    if (options?.withContentType === "NO_CONTENT_TYPE") {
        // Omit the content type
    } else {
        headers.append("Content-Type", options?.withContentType ?? "application/json");
    }
    if (options?.body) {
        requestInit.body = options.body;
    }
    if (options?.cache) {
        requestInit.cache = options.cache;
    }
    return requestInit;
}

function buildBackendPath(path: string): string {
    const host = process.env["INTERNAL_CONFIG_HOST"] ?? process.env["NEXT_PUBLIC_CONFIG_HOST"];
    return `${host}/${path}`;
}

export function buildAuthProxyPath(path: string): string {
    return `/api/${path}`;
}

export function createRequest(path: string, requestInit?: RequestInit, options?: RequestOptions): Promise<Response> {
    return fetch(options?.useAuthProxy ? buildAuthProxyPath(path) : buildBackendPath(path), requestInit);
}

export function get(path: string, options?: RequestOptions): Promise<Response> {
    if (options) {
        options.cache ??= "no-store";
    }
    return createRequest(path, createRequestInit("GET", options), options);
}

export function put(path: string, options?: RequestOptions): Promise<Response> {
    return createRequest(path, createRequestInit("PUT", options), options);
}

export function post(path: string, options?: RequestOptions): Promise<Response> {
    return createRequest(path, createRequestInit("POST", options), options);
}

export function destroy(path: string, options?: RequestOptions): Promise<Response> {
    return createRequest(path, createRequestInit("DELETE", options), options);
}
