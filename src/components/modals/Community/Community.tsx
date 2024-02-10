import { Alert, Badge, Box, Divider, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";

import CommunityUserCard from "@/components/modals/Community/CommunityUserCard";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { ChainProfile } from "@/types/chain";
import { UserRelationship } from "@/types/community";

const Community = ({ chainProfiles }: { chainProfiles: ChainProfile[] }) => {
    const { community, communityLoading, communityError } = useCommunity();
    const theme = useTheme();

    const communityUsers = {
        friends: community?.users.filter((user) => user.relationship === UserRelationship.FRIEND) ?? [],
        request_received:
            community?.users.filter((user) => user.relationship === UserRelationship.REQUEST_RECEIVED) ?? [],
        strangers:
            community?.users.filter(
                (user) =>
                    user.relationship === UserRelationship.REQUEST_SENT ||
                    user.relationship === UserRelationship.UNKNOWN,
            ) ?? [],
    };

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "scroll",
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
                <Typography variant="h6" component="h2">
                    Venner
                </Typography>
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
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="h6" component="h3">
                                        Venneforespørsler
                                    </Typography>
                                    {communityUsers.request_received.length > 0 && (
                                        <Tooltip
                                            title={`Du har ${communityUsers.request_received.length} ubesvarte venneforespørsler`}
                                        >
                                            <Badge
                                                sx={{ ml: 2 }}
                                                badgeContent={communityUsers.request_received.length}
                                                color={"error"}
                                            />
                                        </Tooltip>
                                    )}
                                </Box>
                                {communityUsers.request_received.length === 0 && (
                                    <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                                        Du har ingen ubesvarte venneforespørsler
                                    </Typography>
                                )}
                                {communityUsers.request_received.length > 0 && <Divider sx={{ mt: 1 }} />}
                                {communityUsers.request_received.map((cu) => (
                                    <CommunityUserCard key={cu.name} communityUser={cu} chainProfiles={chainProfiles} />
                                ))}
                            </Box>
                            <Box>
                                <Typography variant="h6" component="h3">
                                    Dine venner
                                </Typography>
                                {communityUsers.friends.length === 0 && (
                                    <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                                        Du har ingen venner
                                    </Typography>
                                )}
                                {communityUsers.friends.length > 0 && <Divider sx={{ mt: 1 }} />}
                                {communityUsers.friends.map((cu) => (
                                    <CommunityUserCard key={cu.name} communityUser={cu} chainProfiles={chainProfiles} />
                                ))}
                            </Box>
                            <Box>
                                <Typography variant="h6" component="h3">
                                    Personer du kanskje kjenner
                                </Typography>
                                {communityUsers.strangers.length === 0 && (
                                    <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                                        Du har ingen venneforslag
                                    </Typography>
                                )}

                                {communityUsers.strangers.length > 0 && <Divider sx={{ mt: 1 }} />}
                                {communityUsers.strangers.map((cu) => (
                                    <CommunityUserCard key={cu.name} communityUser={cu} chainProfiles={chainProfiles} />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Community;
