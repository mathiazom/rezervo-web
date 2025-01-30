export type RequestMode = "client" | "server";

export interface RequestOptions {
    accessToken?: string | undefined;
    body?: BodyInit | undefined;
    cache?: RequestCache;
    withContentType?: string | "NO_CONTENT_TYPE";
    mode?: RequestMode;
    revalidate?: number;
}
