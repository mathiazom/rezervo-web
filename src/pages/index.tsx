import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import IntegrationLogo from "@/components/utils/IntegrationLogo";
import IntegrationLogoSpinner from "@/components/utils/IntegrationLogoSpinner";
import PageHead from "@/components/utils/PageHead";
import activeIntegrations, { IntegrationIdentifier } from "@/lib/activeIntegrations";
import { getStoredSelectedIntegration } from "@/lib/helpers/storage";

function IndexPage() {
    const theme = useTheme();
    const router = useRouter();
    const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);
    const [integrationLoading, setIntegrationLoading] = useState<IntegrationIdentifier | null>(null);

    useEffect(() => {
        const storedIntegration = getStoredSelectedIntegration();
        if (storedIntegration !== null) {
            router.push(`/${storedIntegration}`);
        } else {
            setCheckedLocalStorage(true);
        }
    }, [router]);

    if (!checkedLocalStorage) {
        return;
    }

    return (
        <>
            <PageHead title={"rezervo"} />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        mt: "1rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        color: theme.palette.primary.main,
                    }}
                >
                    rezervo
                </Typography>
                <Typography variant={"h6"} sx={{ padding: "0.5rem", textAlign: "center" }}>
                    Velg treningssenter
                </Typography>
                <Divider />
                <Box
                    sx={{
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                    }}
                >
                    {Object.values(activeIntegrations).map((integration) => {
                        return (
                            <Link
                                key={integration.profile.identifier}
                                href={`/${integration.profile.identifier}`}
                                style={{ width: "100%" }}
                                passHref
                                legacyBehavior
                            >
                                <Button
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        padding: "1.75rem",
                                        height: "6rem",
                                        width: "18rem",
                                    }}
                                    disableTouchRipple
                                    component={"a"}
                                    onClick={() => setIntegrationLoading(integration.profile.identifier)}
                                >
                                    {integrationLoading !== integration.profile.identifier ? (
                                        <IntegrationLogo integrationProfile={integration.profile} />
                                    ) : (
                                        <IntegrationLogoSpinner integrationProfile={integration.profile} />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </Box>
            </Box>
        </>
    );
}

export default IndexPage;
