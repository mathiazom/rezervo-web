export interface RezervoCommunity {
    users: CommunityUser[];
}

export enum UserRelationship {
    UNKNOWN = "UNKNOWN",
    REQUEST_SENT = "REQUEST_SENT",
    REQUEST_RECEIVED = "REQUEST_RECEIVED",
    FRIEND = "FRIEND",
}

export enum UserRelationshipAction {
    ADD_FRIEND = "ADD_FRIEND",
    ACCEPT_FRIEND = "ACCEPT_FRIEND",
    DENY_FRIEND = "DENY_FRIEND",
    REMOVE_FRIEND = "REMOVE_FRIEND",
}

export interface CommunityUser {
    userId: string;
    name: string;
    chains: string[];
    relationship: UserRelationship;
}
