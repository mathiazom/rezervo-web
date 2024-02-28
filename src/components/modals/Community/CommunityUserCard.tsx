import { PersonAdd, PersonRemove } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Avatar, Box, CircularProgress, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useState } from "react";

import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
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
    const { communityLoading, updateRelationship, isUpdatingRelationship } = useCommunity();
    const [confirmDialogState, setConfirmDialogState] = useState<
        UserRelationshipAction.REMOVE_FRIEND | UserRelationshipAction.DENY_FRIEND | null
    >(null);

    const updateUserRelationship = (action: UserRelationshipAction) => {
        return updateRelationship({
            userId: communityUser.userId,
            action,
        });
    };

    const isLoading = communityLoading || isUpdatingRelationship;

    const renderRelationshipActions = (relationship: UserRelationship) => {
        switch (relationship) {
            case UserRelationship.FRIEND:
                return (
                    <LoadingButton
                        loading={isLoading}
                        startIcon={<PersonRemove />}
                        color={"error"}
                        onClick={() => setConfirmDialogState(UserRelationshipAction.REMOVE_FRIEND)}
                    >
                        Fjern venn
                    </LoadingButton>
                );
            case UserRelationship.REQUEST_RECEIVED:
                return (
                    <Box>
                        {isLoading ? (
                            <CircularProgress size={22} thickness={4} sx={{ mr: "1rem" }} />
                        ) : (
                            <Box
                                display={"flex"}
                                alignItems={"center"}
                                sx={{ flexDirection: { xs: "column", sm: "row" } }}
                            >
                                <Button
                                    startIcon={<PersonRemove />}
                                    color={"error"}
                                    onClick={() => setConfirmDialogState(UserRelationshipAction.DENY_FRIEND)}
                                >
                                    Avslå
                                </Button>
                                <Button
                                    startIcon={<PersonAdd />}
                                    onClick={() => updateUserRelationship(UserRelationshipAction.ACCEPT_FRIEND)}
                                >
                                    Godta
                                </Button>
                            </Box>
                        )}
                    </Box>
                );
            case UserRelationship.REQUEST_SENT:
                return (
                    <Button disabled={true} sx={{ fontSize: { xs: 12, sm: 14 } }}>
                        Forespørsel sendt
                    </Button>
                );
            case UserRelationship.UNKNOWN:
            default:
                return (
                    <LoadingButton
                        loading={isLoading}
                        startIcon={<PersonAdd />}
                        onClick={() => updateUserRelationship(UserRelationshipAction.ADD_FRIEND)}
                    >
                        Legg til venn
                    </LoadingButton>
                );
        }
    };

    return (
        <>
            <TableRow sx={{ display: "flex" }}>
                <TableCell
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        px: 0,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            alt={communityUser.name}
                            sx={{
                                backgroundColor: hexColorHash(communityUser.name),
                                width: 36,
                                height: 36,
                                fontSize: 18,
                                mr: 1.5,
                            }}
                        >
                            {communityUser.name[0]}
                        </Avatar>
                        <Box>
                            <Typography variant={"subtitle2"} fontWeight={"bold"}>
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
            {confirmDialogState !== null &&
                (confirmDialogState === UserRelationshipAction.REMOVE_FRIEND ? (
                    <ConfirmationDialog
                        open={true}
                        title={"Fjerne venn?"}
                        description={
                            <>
                                <Typography>
                                    Du er i ferd med å fjerne <b>{communityUser.name}</b> som venn.
                                </Typography>
                                <Typography>Dette kan ikke angres!</Typography>
                            </>
                        }
                        confirmText={"Fjern venn"}
                        onCancel={() => setConfirmDialogState(null)}
                        onConfirm={() => {
                            if (confirmDialogState !== null) {
                                updateUserRelationship(confirmDialogState);
                            }
                            setConfirmDialogState(null);
                        }}
                    />
                ) : (
                    <ConfirmationDialog
                        open={true}
                        title={"Avslå venenforespørsel?"}
                        description={
                            <>
                                <Typography>
                                    Du er i ferd med å avslå <b>{communityUser.name}</b> sin venneforespørsel.
                                </Typography>
                                <Typography>Dette kan ikke angres!</Typography>
                            </>
                        }
                        confirmText={"Avslå forespørsel"}
                        onCancel={() => setConfirmDialogState(null)}
                        onConfirm={() => {
                            if (confirmDialogState !== null) {
                                updateUserRelationship(confirmDialogState);
                            }
                            setConfirmDialogState(null);
                        }}
                    />
                ))}
        </>
    );
};

export default CommunityUserCard;
