import { People } from "@mui/icons-material";
import { Alert, Badge, Box, Divider, Tooltip, Typography } from "@mui/material";
import React, { ReactNode } from "react";

import CommunityUserCard from "@/components/modals/Community/CommunityUserCard";
import ModalWrapper from "@/components/modals/ModalWrapper";
import SubHeader from "@/components/modals/SubHeader";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { ChainProfile } from "@/types/chain";
import { CommunityUser, UserRelationship } from "@/types/community";

const CommunityUserList = ({
    title,
    placeholder,
    communityUsers,
    chainProfiles,
    badge,
}: {
    title: string;
    placeholder: string;
    communityUsers: CommunityUser[];
    chainProfiles: ChainProfile[];
    badge?: ReactNode;
}) => {
    return (
        <Box>
            <SubHeader
                title={title}
                endIcon={badge}
                placeholder={placeholder}
                showPlaceholder={communityUsers.length === 0}
            />
            {communityUsers.length > 0 && <Divider sx={{ mt: 1 }} />}
            {communityUsers.map((cu) => (
                <CommunityUserCard key={cu.name} communityUser={cu} chainProfiles={chainProfiles} />
            ))}
        </Box>
    );
};

const Community = ({ chainProfiles }: { chainProfiles: ChainProfile[] }) => {
    const { community, communityLoading, communityError } = useCommunity();

    const friendRequests =
        community?.users.filter((user) => user.relationship === UserRelationship.REQUEST_RECEIVED) ?? [];
    const FriendRequests = () => {
        return (
            <CommunityUserList
                title={"Venneforespørsler"}
                placeholder={"Du har ingen ubesvarte venneforespørsler"}
                communityUsers={friendRequests}
                chainProfiles={chainProfiles}
                badge={
                    friendRequests.length > 0 && (
                        <Tooltip title={`Du har ${friendRequests.length} ubesvarte venneforespørsler`}>
                            <Badge sx={{ ml: 0.3 }} badgeContent={friendRequests.length} color={"error"} />
                        </Tooltip>
                    )
                }
            />
        );
    };

    return (
        <ModalWrapper
            title={"Venner"}
            icon={<People />}
            description={"Venner kan se hverandres bookinger og timeplaner"}
        >
            {communityError ? (
                <Alert severity="error">
                    <Typography>Klarte ikke laste inn venner.</Typography>
                </Alert>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {community && !communityLoading && (
                        <>
                            {friendRequests.length > 0 && <FriendRequests />}
                            <CommunityUserList
                                title={"Dine venner"}
                                placeholder={"Du har ingen venner"}
                                communityUsers={
                                    community?.users.filter((user) => user.relationship === UserRelationship.FRIEND) ??
                                    []
                                }
                                chainProfiles={chainProfiles}
                            />
                            <CommunityUserList
                                title={"Personer du kanskje kjenner"}
                                placeholder={"Du har ingen venneforslag"}
                                communityUsers={
                                    community?.users.filter(
                                        (user) =>
                                            user.relationship === UserRelationship.REQUEST_SENT ||
                                            user.relationship === UserRelationship.UNKNOWN,
                                    ) ?? []
                                }
                                chainProfiles={chainProfiles}
                            />
                            {friendRequests.length === 0 && <FriendRequests />}
                        </>
                    )}
                </Box>
            )}
        </ModalWrapper>
    );
};

export default Community;
