import { Box, Button, Divider, Drawer, List, ListItem, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

import ChainLogo from "@/components/chain/ChainLogo";
import ChainLogoSpinner from "@/components/chain/ChainLogoSpinner";
import { ListItemButtonLink } from "@/components/utils/links";
import { ISO_WEEK_QUERY_PARAM } from "@/lib/consts";
import { compactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { useChainProfiles } from "@/lib/hooks/useChainProfiles";
import { vars } from "@/lib/theme";
import { useChain } from "@/lib/hooks/useChain";

function ChainSwitcher() {
    const chain = useChain();
    const theme = useTheme();
    const chainProfiles = useChainProfiles();

    const [open, setOpen] = useState(false);
    const [chainLoading, setChainLoading] = useState<string | null>(null);

    useEffect(() => {
        setOpen(false);
        setTimeout(() => setChainLoading(null), 250);
    }, [chain.profile.identifier]);

    return (
        <>
            <Button onClick={() => setOpen(true)} sx={{ paddingX: 0 }}>
                <Box sx={{ height: 25, width: 75 }}>
                    <ChainLogo chainProfile={chain.profile} />
                </Box>
            </Button>
            <Drawer
                anchor={"left"}
                open={open}
                onClose={() => chainLoading == null && setOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            width: "75%",
                            maxWidth: "18rem",
                            background: vars(theme).palette.background.default,
                        },
                    },
                }}
            >
                <List>
                    <Typography variant={"h6"} sx={{ padding: "0.5rem", textAlign: "center" }}>
                        Velg treningssenter
                    </Typography>
                    <Divider />
                    {chainProfiles.map((chainProfile) => {
                        const isLoading = chainLoading !== null;
                        const isCurrentLoadingChain = chainProfile.identifier === chainLoading;
                        const isCurrentChain = chainProfile.identifier === chain.profile.identifier;
                        return (
                            <ListItem
                                value={chainProfile.identifier}
                                key={chainProfile.identifier}
                                sx={{ margin: 0, padding: 0 }}
                                onClick={() =>
                                    !isLoading &&
                                    (isCurrentChain ? setOpen(false) : setChainLoading(chainProfile.identifier))
                                }
                            >
                                <ListItemButtonLink
                                    to="/$chain"
                                    params={{ chain: chainProfile.identifier }}
                                    search={{
                                        [ISO_WEEK_QUERY_PARAM]: compactISOWeekString(LocalizedDateTime.now()),
                                    }}
                                    sx={[
                                        {
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "1.75rem",
                                            height: "6rem",
                                            width: "100%",
                                        },
                                        isLoading || isCurrentChain
                                            ? {
                                                  pointerEvents: "none",
                                                  touchEvents: "none",
                                              }
                                            : {},
                                    ]}
                                    disableTouchRipple
                                    disabled={isLoading && !isCurrentLoadingChain}
                                    selected={isCurrentLoadingChain || (!isLoading && isCurrentChain)}
                                >
                                    {!isLoading || chainLoading !== chainProfile.identifier ? (
                                        <ChainLogo chainProfile={chainProfile} />
                                    ) : (
                                        <ChainLogoSpinner chainProfile={chainProfile} />
                                    )}
                                </ListItemButtonLink>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>
        </>
    );
}

export default ChainSwitcher;
