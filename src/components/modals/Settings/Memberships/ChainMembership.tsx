import { EditRounded } from "@mui/icons-material";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import {
    Avatar,
    Box,
    CircularProgress,
    FormGroup,
    FormLabel,
    Switch,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { ChainProfile } from "@/types/chain";
import { ChainConfigPayload } from "@/types/config";

function ChainMembership({
    chainProfile,
    openMembershipLoginModal,
}: {
    chainProfile: ChainProfile;
    openMembershipLoginModal: () => void;
}) {
    const { userConfig, putUserConfig } = useUserConfig(chainProfile.identifier);
    const theme = useTheme();
    const { chainUser, chainUserError, chainUserLoading } = useChainUser(chainProfile.identifier);
    const hasChainUser = chainUser !== undefined && chainUserError == undefined && !chainUserLoading;

    const [bookingActiveLoading, setBookingActiveLoading] = useState(false);
    const [bookingActive, setBookingActive] = useState<boolean | null>(null);
    async function onBookingActiveChanged(active: boolean) {
        setBookingActive(active);
        setBookingActiveLoading(true);
        await putUserConfig({
            ...userConfig,
            active: active,
        } as ChainConfigPayload);
        setBookingActiveLoading(false);
    }
    useEffect(() => {
        setBookingActive(userConfig?.active ?? null);
    }, [userConfig]);
    return (
        <FormGroup sx={{ gap: "1rem" }}>
            <FormGroup
                sx={{
                    paddingBottom: "0.75rem",
                    backgroundColor: theme.palette.secondaryBackground.default,
                    padding: "1rem 1.25rem",
                    borderRadius: "6px",
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        maxWidth: "100%",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Tooltip title={chainProfile.name} arrow>
                            <RippleBadge
                                invisible={chainUserLoading}
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                variant={"dot"}
                                rippleColor={!hasChainUser || !chainUser.isAuthVerified ? "#FF0000" : "#44b700"}
                            >
                                <Avatar
                                    sx={{ width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }}
                                    src={`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${chainProfile.images.common.smallLogo}`}
                                >
                                    {chainProfile.identifier}
                                </Avatar>
                            </RippleBadge>
                        </Tooltip>
                        <Typography
                            noWrap
                            sx={{
                                flexGrow: 1,
                                opacity: 0.6,
                                color: theme.palette.primary.contrastText,
                            }}
                        >
                            {chainUser?.username}
                        </Typography>
                        <FormLabel sx={{ mr: 0.8 }}>
                            <IconButton onClick={openMembershipLoginModal}>
                                <EditRounded />
                            </IconButton>
                        </FormLabel>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1, pl: 0.4 }}>
                        <PlayCircleOutlineRoundedIcon />
                        <Typography
                            sx={{
                                userSelect: "none",
                                fontSize: {
                                    xs: "0.85rem",
                                    sm: "1rem",
                                },
                            }}
                        >
                            Automatisk booking
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "right",
                                flexGrow: 1,
                            }}
                        >
                            {bookingActiveLoading && <CircularProgress size="1rem" />}
                            {bookingActive !== null && (
                                <Switch
                                    checked={bookingActive}
                                    onChange={(_, checked) => onBookingActiveChanged(checked)}
                                    inputProps={{
                                        "aria-label": "booking-aktiv",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </FormGroup>
        </FormGroup>
    );
}
export default ChainMembership;
