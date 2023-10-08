import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import IntegrationLogo from "@/components/utils/IntegrationLogo";
import IntegrationLogoSpinner from "@/components/utils/IntegrationLogoSpinner";
import activeIntegrations, { IntegrationIdentifier } from "@/lib/activeIntegrations";
import { IntegrationProfile } from "@/types/integration";

function SelectIntegration({ currentIntegrationProfile }: { currentIntegrationProfile: IntegrationProfile }) {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [integrationLoading, setIntegrationLoading] = useState<IntegrationIdentifier | null>(null);

    useEffect(() => {
        setOpen(false);
        setTimeout(() => setIntegrationLoading(null), 250);
    }, [currentIntegrationProfile]);

    return (
        <>
            <Button onClick={() => setOpen(true)} sx={{ paddingX: 0 }}>
                <Box sx={{ height: 25, width: 75 }}>
                    <IntegrationLogo integrationProfile={currentIntegrationProfile} />
                </Box>
            </Button>
            <Drawer
                anchor={"left"}
                open={open}
                onClose={() => integrationLoading == null && setOpen(false)}
                PaperProps={{ sx: { width: "75%", maxWidth: "18rem", background: theme.palette.background.default } }}
            >
                <List>
                    <Typography variant={"h6"} sx={{ padding: "0.5rem", textAlign: "center" }}>
                        Velg treningssenter
                    </Typography>
                    <Divider />
                    {Object.values(activeIntegrations).map((integration) => {
                        const isLoading = integrationLoading !== null;
                        const isCurrentLoadingIntegration = integration.profile.identifier === integrationLoading;
                        const isCurrentIntegration =
                            integration.profile.identifier === currentIntegrationProfile.identifier;
                        return (
                            <ListItem
                                value={integration.profile.identifier}
                                key={integration.profile.identifier}
                                sx={{ margin: 0, padding: 0 }}
                                onClick={() =>
                                    !isLoading &&
                                    (isCurrentIntegration
                                        ? setOpen(false)
                                        : setIntegrationLoading(integration.profile.identifier))
                                }
                            >
                                <Link
                                    href={`/${integration.profile.identifier}`}
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
                                            ...(isLoading || isCurrentIntegration
                                                ? {
                                                      pointerEvents: "none",
                                                      touchEvents: "none",
                                                  }
                                                : {}),
                                        }}
                                        disableTouchRipple
                                        disabled={isLoading && !isCurrentLoadingIntegration}
                                        selected={isCurrentLoadingIntegration || (!isLoading && isCurrentIntegration)}
                                        component={"a"}
                                    >
                                        {!isLoading || integrationLoading !== integration.profile.identifier ? (
                                            <IntegrationLogo integrationProfile={integration.profile} />
                                        ) : (
                                            <IntegrationLogoSpinner integrationProfile={integration.profile} />
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

export default SelectIntegration;
