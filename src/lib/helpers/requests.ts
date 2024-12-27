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
    if (options?.withContentType !== "NO_CONTENT_TYPE") {
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

function buildInternalBackendPath(path: string): string {
    const host = global.process.env["INTERNAL_CONFIG_HOST"] ?? process.env["NEXT_PUBLIC_CONFIG_HOST"];
    return `${host}/${path}`;
}

export function buildPublicBackendPath(path: string): string {
    const host = process.env["NEXT_PUBLIC_CONFIG_HOST"];
    return `${host}/${path}`;
}

export async function fetchProtectedImageAsDataUrl(imageUrl: string, authToken: string) {
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${authToken}`);
    const response = await fetch(imageUrl, { headers });
    const binaryData = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(binaryData))));
    return `data:image/png;base64,${base64}`;
}

export function createRequest(path: string, requestInit?: RequestInit, options?: RequestOptions): Promise<Response> {
    return fetch(
        options?.mode === "server" ? buildInternalBackendPath(path) : buildPublicBackendPath(path),
        requestInit,
    );
}

export function createRequestFromOptions(path: string, method: HTTP_METHOD, options?: RequestOptions) {
    return createRequest(path, createRequestInit(method, options), options);
}

export function get(path: string, options?: RequestOptions): Promise<Response> {
    if (options) {
        options.cache ??= "no-store";
    }
    return createRequestFromOptions(path, "GET", options);
}

export function put(path: string, options?: RequestOptions): Promise<Response> {
    return createRequestFromOptions(path, "PUT", options);
}

export function post(path: string, options?: RequestOptions): Promise<Response> {
    return createRequestFromOptions(path, "POST", options);
}

export function destroy(path: string, options?: RequestOptions): Promise<Response> {
    return createRequestFromOptions(path, "DELETE", options);
}
