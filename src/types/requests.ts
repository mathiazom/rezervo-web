export type RequestMode = "client" | "server" | "authProxy";

export type RequestOptions = {
    accessToken?: string | undefined;
    body?: BodyInit | undefined;
    cache?: RequestCache;
    withContentType?: string | "NO_CONTENT_TYPE";
    mode?: RequestMode;
};
