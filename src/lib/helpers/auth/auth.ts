import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export type CustomJWT = JWT & {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    expiresAtISO: string;
    error?: "AccessTokenError" | "RefreshAccessTokenError";
};

export function isCustomJWT(token: JWT): token is CustomJWT {
    return (
        typeof token === "object" &&
        "accessToken" in token &&
        "refreshToken" in token &&
        "expiresAt" in token &&
        "expiresAtISO" in token
    );
}

export type CustomSession = Session & Pick<CustomJWT, "accessToken" | "expiresAt" | "error">;

export function isCustomSession(session: Session): session is CustomSession {
    return typeof session === "object" && "accessToken" in session && "expiresAt" in session;
}
