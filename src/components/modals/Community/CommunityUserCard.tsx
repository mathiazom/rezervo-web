import { PersonAdd, PersonRemove } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Avatar, Box, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useState } from "react";

import { useCommunity } from "@/lib/hooks/useCommunity";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ChainProfile } from "@/types/chain";
import { CommunityUser, UserRelationship, UserRelationshipAction } from "@/types/community";

const CommunityUserCard = ({
    communityUser,
    chainProfiles,
}: {
    communityUser: CommunityUser;
    chainProfiles: ChainProfile[];
}) => {
    const { mutateCommunity } = useCommunity();
    async function updateRelationship(action: UserRelationshipAction) {
        setIsLoading(true);
        await fetch(`/api/community/relationship`, {
            method: "PUT",
            body: JSON.stringify({ userId: communityUser.userId, action }, null, 2),
        });
        await mutateCommunity();
        setIsLoading(false);
    }

    const [isLoading, setIsLoading] = useState(false);

    const renderRelationshipActions = (relationship: UserRelationship) => {
        switch (relationship) {
            case UserRelationship.FRIEND:
                return (
                    <LoadingButton
                        loading={isLoading}
                        startIcon={<PersonRemove />}
                        color={"error"}
                        onClick={() => updateRelationship(UserRelationshipAction.REMOVE_FRIEND)}
                    >
                        Fjern venn
                    </LoadingButton>
                );
            case UserRelationship.REQUEST_RECEIVED:
                return (
                    <Box>
                        <LoadingButton
                            loading={isLoading}
                            startIcon={<PersonRemove />}
                            color={"error"}
                            onClick={() => updateRelationship(UserRelationshipAction.DENY_FRIEND)}
                        >
                            Avslå
                        </LoadingButton>
                        <LoadingButton
                            loading={isLoading}
                            startIcon={<PersonAdd />}
                            onClick={() => updateRelationship(UserRelationshipAction.ACCEPT_FRIEND)}
                        >
                            Godta
                        </LoadingButton>
                    </Box>
                );
            case UserRelationship.REQUEST_SENT:
                return <Button disabled={true}>Forespørsel sendt</Button>;
            case UserRelationship.UNKNOWN:
            default:
                return (
                    <LoadingButton
                        loading={isLoading}
                        startIcon={<PersonAdd />}
                        onClick={() => updateRelationship(UserRelationshipAction.ADD_FRIEND)}
                    >
                        Legg til venn
                    </LoadingButton>
                );
        }
    };

    return (
        <TableRow sx={{ display: "flex" }}>
            <TableCell
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 0 }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                        alt={communityUser.name}
                        sx={{
                            backgroundColor: hexColorHash(communityUser.name),
                            width: 50,
                            height: 50,
                            mr: 1.2,
                        }}
                    >
                        <Typography variant={"h6"}>{communityUser.name[0]}</Typography>
                    </Avatar>
                    <Box>
                        <Typography variant={"subtitle1"} fontWeight={"bold"}>
                            {communityUser.name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                            {communityUser.chains
                                .sort((a, b) => a.localeCompare(b))
                                .map((chain) => {
                                    const chainProfile = chainProfiles.find(
                                        (chainProfile) => chainProfile.identifier === chain,
                                    );
                                    if (chainProfile === undefined) return <></>;
                                    return (
                                        <Tooltip title={chainProfile.name} key={chain}>
                                            <Avatar
                                                sx={{ width: 16, height: 16 }}
                                                src={chainProfile.images.common.smallLogo ?? ""}
                                            >
                                                {chain}
                                            </Avatar>
                                        </Tooltip>
                                    );
                                })}
                        </Box>
                    </Box>
                </Box>
                {renderRelationshipActions(communityUser.relationship)}
            </TableCell>
        </TableRow>
    );
};

export default CommunityUserCard;
