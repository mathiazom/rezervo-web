import { constants } from "http2";

import { AppRouteHandlerFnContext, getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

import { ChainIdentifier } from "@/types/chain";

export function chainIdentifierFromContext(context: AppRouteHandlerFnContext): ChainIdentifier | null {
    const chainArg = context.params["chain"];
    return (typeof chainArg !== "string" ? chainArg?.pop() : chainArg) as ChainIdentifier;
}

export async function tryUseRefreshToken(req: NextRequest): Promise<string | undefined> {
    // If your access token is expired, and you have a refresh token
    // `getAccessToken` will fetch you a new one using the `refresh_token` grant
    const { accessToken } = await getAccessToken(req, new NextResponse());
    return accessToken;
}

export function buildBackendPath(path: string): string {
    const host = process.env["INTERNAL_CONFIG_HOST"] ?? process.env["NEXT_PUBLIC_CONFIG_HOST"];
    return `${host}/${path}`;
}

export function respondUnauthorized(): Response {
    return Response.json("Not authenticated", { status: constants.HTTP_STATUS_UNAUTHORIZED });
}

export function respondInternalServerError(): Response {
    return Response.json("Request failed", { status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR });
}
export function respondNotFound(): Response {
    return Response.json("Not found", { status: constants.HTTP_STATUS_NOT_FOUND });
}

export function respondNonOkResponse(response: Response): Response {
    return Response.json(response.statusText, { status: response.status });
}

export async function doOperation(operation: () => Promise<Response>): Promise<Response> {
    const response = await operation();

    if (response == null) {
        return respondInternalServerError();
    }
    if (!response.ok) {
        console.error(response);
        return respondNonOkResponse(response);
    }

    return response;
}

export function get(path: string, accessToken: string): Promise<Response> {
    return fetch(buildBackendPath(path), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
    });
}

export function put(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    const requestInit: RequestInit = {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    };
    if (body) {
        requestInit.body = body;
    }
    return fetch(buildBackendPath(path), requestInit);
}

export function post(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    const requestInit: RequestInit = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    };
    if (body) {
        requestInit.body = body;
    }
    return fetch(buildBackendPath(path), requestInit);
}
export function destroy(path: string, accessToken: string, body?: BodyInit): Promise<Response> {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    };
    if (body) {
        requestInit.body = body;
    }
    return fetch(buildBackendPath(path), requestInit);
}
