import {
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    Typography,
    useTheme,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import IntegrationLogo from "@/components/utils/IntegrationLogo";
import activeIntegrations, { IntegrationIdentifier } from "@/lib/integrations/active";
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
                        const isCurrentLoadingIntegration = integration.profile.acronym === integrationLoading;
                        const isCurrentIntegration = integration.profile.acronym === currentIntegrationProfile.acronym;
                        return (
                            <ListItem
                                value={integration.profile.acronym}
                                key={integration.profile.acronym}
                                sx={{ margin: 0, padding: 0 }}
                                onClick={() =>
                                    !isLoading &&
                                    (isCurrentIntegration
                                        ? setOpen(false)
                                        : setIntegrationLoading(integration.profile.acronym))
                                }
                            >
                                <Link
                                    href={`/${integration.profile.acronym}`}
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
                                        {!isLoading || integrationLoading !== integration.profile.acronym ? (
                                            <IntegrationLogo integrationProfile={integration.profile} />
                                        ) : (
                                            <Avatar
                                                sx={{
                                                    width: "3rem",
                                                    height: "3rem",
                                                    animation: "spin 0.8s linear infinite",
                                                    "@keyframes spin": {
                                                        "0%": {
                                                            transform: "rotate(0deg)",
                                                        },
                                                        "100%": {
                                                            transform: "rotate(360deg)",
                                                        },
                                                    },
                                                }}
                                                src={integration.profile.images.common.smallLogo}
                                            >
                                                {integration.profile.acronym}
                                            </Avatar>
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
