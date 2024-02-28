import { People } from "@mui/icons-material";
import { Alert, Badge, Box, Divider, Tooltip, Typography, useTheme } from "@mui/material";
import React, { ReactNode, useState } from "react";

import CommunityUserCard from "@/components/modals/Community/CommunityUserCard";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { ChainProfile } from "@/types/chain";
import { CommunityUser, UserRelationship, UserRelationshipAction } from "@/types/community";

const CommunityUserList = ({
    title,
    defaultText,
    communityUsers,
    chainProfiles,
    onRemoveFriend,
    badge,
}: {
    title: string;
    defaultText: string;
    communityUsers: CommunityUser[];
    chainProfiles: ChainProfile[];
    onRemoveFriend: (communityUser: CommunityUser) => void;
    badge?: ReactNode;
}) => {
    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontSize: 18 }}>
                    {title}
                </Typography>
                {badge}
            </Box>
            {communityUsers.length === 0 && (
                <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                    {defaultText}
                </Typography>
            )}
            {communityUsers.length > 0 && <Divider sx={{ mt: 1 }} />}
            {communityUsers.map((cu) => (
                <CommunityUserCard
                    key={cu.name}
                    communityUser={cu}
                    chainProfiles={chainProfiles}
                    onRemoveFriend={onRemoveFriend}
                />
            ))}
        </Box>
    );
};

const Community = ({ chainProfiles }: { chainProfiles: ChainProfile[] }) => {
    const { community, communityLoading, communityError, updateRelationship } = useCommunity();
    const theme = useTheme();
    const [friendUpForRemoval, setFriendUpForRemoval] = useState<CommunityUser | null>(null);

    const friendRequests =
        community?.users.filter((user) => user.relationship === UserRelationship.REQUEST_RECEIVED) ?? [];
    const FriendRequests = () => {
        return (
            <CommunityUserList
                title={"Venneforespørsler"}
                defaultText={"Du har ingen ubesvarte venneforespørsler"}
                communityUsers={friendRequests}
                chainProfiles={chainProfiles}
                onRemoveFriend={() => {}}
                badge={
                    friendRequests.length > 0 && (
                        <Tooltip title={`Du har ${friendRequests.length} ubesvarte venneforespørsler`}>
                            <Badge sx={{ ml: 2 }} badgeContent={friendRequests.length} color={"error"} />
                        </Tooltip>
                    )
                }
            />
        );
    };

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "auto",
                maxWidth: 520,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#111",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    paddingBottom: 1,
                }}
            >
                <Box display={"flex"} alignItems={"center"} gap={1}>
                    <People />
                    <Typography variant="h6" component="h2">
                        Venner
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    style={{
                        color: theme.palette.grey[600],
                        fontSize: 15,
                    }}
                    textAlign={"center"}
                    mb={2.5}
                >
                    Venner kan se hverandres bookinger og timeplaner
                </Typography>
            </Box>
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
                                defaultText={"Du har ingen venner"}
                                communityUsers={
                                    community?.users.filter((user) => user.relationship === UserRelationship.FRIEND) ??
                                    []
                                }
                                chainProfiles={chainProfiles}
                                onRemoveFriend={(communityUser) => {
                                    setFriendUpForRemoval(communityUser);
                                }}
                            />
                            <CommunityUserList
                                title={"Personer du kanskje kjenner"}
                                defaultText={"Du har ingen venneforslag"}
                                communityUsers={
                                    community?.users.filter(
                                        (user) =>
                                            user.relationship === UserRelationship.REQUEST_SENT ||
                                            user.relationship === UserRelationship.UNKNOWN,
                                    ) ?? []
                                }
                                chainProfiles={chainProfiles}
                                onRemoveFriend={() => {}}
                            />
                            {friendRequests.length === 0 && <FriendRequests />}
                        </>
                    )}
                    <ConfirmationDialog
                        open={friendUpForRemoval !== null}
                        title={`Fjerne venn?`}
                        description={
                            <>
                                <Typography>
                                    Du er i ferd med å fjerne <b>{friendUpForRemoval?.name}</b> som venn.
                                </Typography>
                                <Typography>Dette kan ikke angres!</Typography>
                            </>
                        }
                        confirmText={"Fjern venn"}
                        onCancel={() => setFriendUpForRemoval(null)}
                        onConfirm={() => {
                            if (friendUpForRemoval !== null) {
                                updateRelationship({
                                    userId: friendUpForRemoval.userId,
                                    action: UserRelationshipAction.REMOVE_FRIEND,
                                });
                            }
                            setFriendUpForRemoval(null);
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Community;
