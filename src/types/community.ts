import { Schemas } from "@/types/api-helpers";

export type CommunityUser = Schemas["CommunityUser"];

export type UserRelationship = Schemas["UserRelationship"];

export const UserRelationship = {
    UNKNOWN: "UNKNOWN",
    REQUEST_SENT: "REQUEST_SENT",
    REQUEST_RECEIVED: "REQUEST_RECEIVED",
    FRIEND: "FRIEND",
} as const satisfies Record<string, UserRelationship>;

export type UserRelationshipAction = Schemas["UserRelationshipAction"];

export const UserRelationshipAction = {
    ADD_FRIEND: "ADD_FRIEND",
    ACCEPT_FRIEND: "ACCEPT_FRIEND",
    DENY_FRIEND: "DENY_FRIEND",
    REMOVE_FRIEND: "REMOVE_FRIEND",
} as const satisfies Record<string, UserRelationshipAction>;
