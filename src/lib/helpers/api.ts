import { AppRouteHandlerFn, AppRouteHandlerFnContext, getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { NextRequest, NextResponse } from "next/server";

import { ChainIdentifier } from "@/types/chain";

export function isUserMeFromContext(context: AppRouteHandlerFnContext): boolean {
    return userIdFromContext(context) === "me";
}

export function userIdFromContext(context: AppRouteHandlerFnContext): string | null {
    const userIdArg = context.params["userId"];
    return (typeof userIdArg !== "string" ? userIdArg?.pop() : userIdArg) as string;
}

export function thumbnailSizeFromContext(context: AppRouteHandlerFnContext): string | null {
    const sizeArg = context.params["size"];
    return (typeof sizeArg !== "string" ? sizeArg?.pop() : sizeArg) as string;
}

export function chainIdentifierFromContext(context: AppRouteHandlerFnContext): ChainIdentifier | null {
    const chainArg = context.params["chain"];
    return (typeof chainArg !== "string" ? chainArg?.pop() : chainArg) as ChainIdentifier;
}

export function respondInternalServerError(): Response {
    return Response.json("Request failed", { status: 500 });
}

export function respondNotFound(): Response {
    return Response.json("Not found", { status: 404 });
}

export async function doOperation(operation: () => Promise<Response>): Promise<Response> {
    const response = await operation();

    if (response == null) {
        return respondInternalServerError();
    }
    if (!response.ok) {
        console.error(response);
        return Response.json(response.statusText, { status: response.status });
    }

    return response;
}

function createRequestInit(
    method: HTTP_METHOD,
    accessToken?: string,
    body?: BodyInit,
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
    if (body) {
        requestInit.body = body;
        headers.append("Content-Type", "application/json");
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

export function get(path: string, accessToken?: string): Promise<Response> {
    return fetch(buildBackendPath(path), createRequestInit("GET", accessToken, undefined, "no-store"));
}

export function put(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    return fetch(buildBackendPath(path), createRequestInit("PUT", accessToken, body));
}

export function post(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    return fetch(buildBackendPath(path), createRequestInit("POST", accessToken, body));
}
export function destroy(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    return fetch(buildBackendPath(path), createRequestInit("DELETE", accessToken, body));
}

export function createAuthenticatedEndpoint(
    handler: (req: NextRequest, ctx: AppRouteHandlerFnContext, accessToken: string) => Promise<Response>,
): AppRouteHandlerFn {
    return withApiAuthRequired(async (req, ctx) => {
        // If your access token is expired, and you have a refresh token
        // `getAccessToken` will fetch you a new one using the `refresh_token` grant
        const { accessToken } = await getAccessToken(req, new NextResponse());

        if (!accessToken) return Response.json("Not authenticated", { status: 403 });
        return handler(req, ctx as AppRouteHandlerFnContext, accessToken);
    });
}

export function createGenericEndpoint(
    method: HTTP_METHOD,
    targetPath: string,
    options?: { withChainIdentifier?: boolean; checkUserIsMe?: boolean; useFormData?: boolean },
): AppRouteHandlerFn {
    return createAuthenticatedEndpoint(async (req, ctx, accessToken) => {
        let pathPrefix = "";
        if (options?.withChainIdentifier) {
            const chainIdentifier = chainIdentifierFromContext(ctx);
            if (chainIdentifier === null) return respondNotFound();
            pathPrefix += `${chainIdentifier}/`;
        }

        if (options?.checkUserIsMe && !isUserMeFromContext(ctx)) {
            return respondNotFound();
        }

        let body: BodyInit | undefined;
        if (["POST", "PUT", "DELETE"].includes(method)) {
            if (options?.useFormData) {
                body = await req.formData();
            } else {
                body = await req.text();
            }
        }

        switch (method) {
            case "GET":
                return await doOperation(() => get(pathPrefix + targetPath, accessToken));
            case "POST":
                return await doOperation(() => post(pathPrefix + targetPath, accessToken, body));
            case "PUT":
                return await doOperation(() => put(pathPrefix + targetPath, accessToken, body));
            case "DELETE":
                return await doOperation(() => destroy(pathPrefix + targetPath, accessToken, body));

            default:
                throw new Error("HTTP method not implemented");
        }
    });
}
