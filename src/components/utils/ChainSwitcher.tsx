import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import ChainLogoSpinner from "@/components/utils/ChainLogoSpinner";
import activeChains, { ChainIdentifier } from "@/lib/activeChains";
import { ChainProfile } from "@/types/chain";

function ChainSwitcher({ currentChainProfile }: { currentChainProfile: ChainProfile }) {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [chainLoading, setChainLoading] = useState<ChainIdentifier | null>(null);

    useEffect(() => {
        setOpen(false);
        setTimeout(() => setChainLoading(null), 250);
    }, [currentChainProfile]);

    return (
        <>
            <Button onClick={() => setOpen(true)} sx={{ paddingX: 0 }}>
                <Box sx={{ height: 25, width: 75 }}>
                    <ChainLogo chainProfile={currentChainProfile} />
                </Box>
            </Button>
            <Drawer
                anchor={"left"}
                open={open}
                onClose={() => chainLoading == null && setOpen(false)}
                PaperProps={{ sx: { width: "75%", maxWidth: "18rem", background: theme.palette.background.default } }}
            >
                <List>
                    <Typography variant={"h6"} sx={{ padding: "0.5rem", textAlign: "center" }}>
                        Velg treningssenter
                    </Typography>
                    <Divider />
                    {Object.values(activeChains).map((chain) => {
                        const isLoading = chainLoading !== null;
                        const isCurrentLoadingChain = chain.profile.identifier === chainLoading;
                        const isCurrentChain = chain.profile.identifier === currentChainProfile.identifier;
                        return (
                            <ListItem
                                value={chain.profile.identifier}
                                key={chain.profile.identifier}
                                sx={{ margin: 0, padding: 0 }}
                                onClick={() =>
                                    !isLoading &&
                                    (isCurrentChain ? setOpen(false) : setChainLoading(chain.profile.identifier))
                                }
                            >
                                <Link
                                    href={`/${chain.profile.identifier}`}
                                    style={{ width: "100%" }}
                                    passHref
                                    legacyBehavior
                                >
                                    <ListItemButton
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "1.75rem",
                                            height: "6rem",
                                            width: "100%",
                                            ...(isLoading || isCurrentChain
                                                ? {
                                                      pointerEvents: "none",
                                                      touchEvents: "none",
                                                  }
                                                : {}),
                                        }}
                                        disableTouchRipple
                                        disabled={isLoading && !isCurrentLoadingChain}
                                        selected={isCurrentLoadingChain || (!isLoading && isCurrentChain)}
                                        component={"a"}
                                    >
                                        {!isLoading || chainLoading !== chain.profile.identifier ? (
                                            <ChainLogo chainProfile={chain.profile} />
                                        ) : (
                                            <ChainLogoSpinner chainProfile={chain.profile} />
                                        )}
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>
        </>
    );
}

export default ChainSwitcher;
